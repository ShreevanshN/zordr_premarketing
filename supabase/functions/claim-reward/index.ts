// supabase/functions/claim-reward
//
// POST body: { studentId: string }
//
// Implements the PRD flow: Student clicks card -> Backend -> Random Reward
// -> Reserve Coupon -> Send WhatsApp -> Return Success.
//
// - Weighted-random reward pick, using each college's `rewards.probability`.
// - Generates a fresh coupon code per claim (these are percentage-off
//   codes, not a fixed pre-printed pool, so there's nothing to "run out of").
// - Enforces "claim only once": if the student already has a reward, this
//   returns their existing reward instead of assigning a new one (idempotent
//   — safe to call again after a page refresh).
// - sendReward() is a stub for now: no WhatsApp Business API is connected
//   yet, so it just logs. Swap the body of sendReward() for a real API call
//   once that's wired up — nothing else in this function needs to change.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomCode(length = 6) {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

function pickWeightedReward(rewards) {
  const totalProbability = rewards.reduce((sum, r) => sum + Number(r.probability), 0) || 1;
  let roll = Math.random() * totalProbability;
  for (const reward of rewards) {
    roll -= Number(reward.probability);
    if (roll <= 0) return reward;
  }
  return rewards[rewards.length - 1]; // floating point fallback
}

// TODO(Phase 2.5): swap this for a real WhatsApp Business Cloud API call
// once the business number is connected. Keeping it isolated here means
// nothing else in this function needs to change when that happens.
async function sendReward(_student, _reward, _couponCode) {
  console.log(`[sendReward] WhatsApp not yet connected — skipping send for student ${_student.id}`);
  return { sent: false, reason: 'whatsapp_not_configured' };
}

function couponPayload(reward, couponCode) {
  return {
    rewardTitle: reward.title,
    rewardDescription: reward.description,
    couponCode,
    minOrderValue: reward.min_order_value,
    maxDiscountAmount: reward.max_discount_amount,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { studentId } = await req.json();
    if (!studentId) return jsonResponse({ error: 'studentId is required' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, college_id, reward_id, coupon_id')
      .eq('id', studentId)
      .maybeSingle();

    if (studentError) return jsonResponse({ error: studentError.message }, 500);
    if (!student) return jsonResponse({ error: 'Student not found' }, 404);

    // Already claimed -- idempotent: hand back what they already got
    // instead of assigning a second reward (PRD: "every student can claim
    // only once").
    if (student.reward_id && student.coupon_id) {
      const [{ data: reward }, { data: coupon }] = await Promise.all([
        supabase.from('rewards').select('*').eq('id', student.reward_id).single(),
        supabase.from('coupons').select('coupon_code').eq('id', student.coupon_id).single(),
      ]);
      return jsonResponse({ ...couponPayload(reward, coupon.coupon_code), alreadyClaimed: true });
    }

    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('*')
      .eq('college_id', student.college_id)
      .eq('active', true);

    if (rewardsError) return jsonResponse({ error: rewardsError.message }, 500);
    if (!rewards || rewards.length === 0) {
      return jsonResponse({ error: 'No active rewards configured for this college' }, 500);
    }

    const chosenReward = pickWeightedReward(rewards);

    const { data: college } = await supabase
      .from('colleges')
      .select('short_name')
      .eq('id', student.college_id)
      .single();
    const prefix = (college?.short_name || 'ZDR').toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Generate a unique coupon code, retrying on the rare collision.
    let coupon = null;
    for (let attempt = 0; attempt < 5 && !coupon; attempt++) {
      const candidateCode = `${prefix}-${randomCode(6)}`;
      const { data: insertedCoupon, error: couponError } = await supabase
        .from('coupons')
        .insert({
          college_id: student.college_id,
          coupon_code: candidateCode,
          reward_id: chosenReward.id,
          claimed: true,
          claimed_by: student.id,
          claimed_at: new Date().toISOString(),
        })
        .select('id, coupon_code')
        .single();

      if (!insertedCoupon && couponError?.code === '23505') continue; // code collision, retry
      if (couponError) return jsonResponse({ error: couponError.message }, 500);
      coupon = insertedCoupon;
    }

    if (!coupon) {
      return jsonResponse({ error: 'Could not generate a unique coupon code, please try again' }, 500);
    }

    // Atomic "claim only once" guard: only succeeds if reward_id is still
    // null. If another request beat us here (double-click / race), this
    // updates 0 rows and we roll back the coupon we just created.
    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update({ reward_id: chosenReward.id, coupon_id: coupon.id, status: 'reward_claimed' })
      .eq('id', student.id)
      .is('reward_id', null)
      .select('id')
      .maybeSingle();

    if (updateError) return jsonResponse({ error: updateError.message }, 500);

    if (!updatedStudent) {
      // Lost the race -- undo the coupon we reserved, then return the
      // reward that actually won.
      await supabase.from('coupons').delete().eq('id', coupon.id);
      const { data: freshStudent } = await supabase
        .from('students')
        .select('reward_id, coupon_id')
        .eq('id', student.id)
        .single();
      const [{ data: existingReward }, { data: existingCoupon }] = await Promise.all([
        supabase.from('rewards').select('*').eq('id', freshStudent.reward_id).single(),
        supabase.from('coupons').select('coupon_code').eq('id', freshStudent.coupon_id).single(),
      ]);
      return jsonResponse({ ...couponPayload(existingReward, existingCoupon.coupon_code), alreadyClaimed: true });
    }

    await sendReward(student, chosenReward, coupon.coupon_code);

    return jsonResponse({ ...couponPayload(chosenReward, coupon.coupon_code), alreadyClaimed: false });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
