// supabase/functions/_shared/referrals.ts
//
// The core of the PRD's applyReferral() flow:
//   Validate -> Store Referral -> Increase Count -> Check Milestone
//   -> Assign Reward -> Notify Referrer
//
// This lives in a shared module (not just inline in create-student) so it
// can also be called from the standalone `apply-referral` Edge Function --
// e.g. to reprocess a signup whose ?ref= code gets corrected after the
// fact, without needing to touch this logic twice.
import { randomCode } from './codegen.ts';

// TODO(Phase 2.5, same as sendReward in claim-reward): swap for a real
// WhatsApp Business Cloud API call once a provider is connected.
async function notifyReferrer(referrerId, milestoneReward, couponCode) {
  console.log(`[notifyReferrer] WhatsApp not yet connected -- skipping notify for referrer ${referrerId}, unlocked "${milestoneReward.title}" (${couponCode})`);
  return { sent: false, reason: 'whatsapp_not_configured' };
}

/**
 * @param {import('jsr:@supabase/supabase-js@2').SupabaseClient} supabase - service-role client
 * @param {{ collegeId: string, referrerCode: string, referredStudentId: string }} params
 * @returns {Promise<{ referrerId: string, referralCount: number, milestoneHit: object|null } | null>}
 *   null means no-op: no valid ref code, self-referral, or already recorded.
 */
export async function applyReferral(supabase, { collegeId, referrerCode, referredStudentId }) {
  if (!referrerCode) return null;

  const { data: referrer } = await supabase
    .from('students')
    .select('id')
    .eq('college_id', collegeId)
    .eq('referral_code', String(referrerCode).trim().toUpperCase())
    .maybeSingle();

  // Invalid code, or someone somehow referred themselves -- silently no-op
  // rather than blocking their signup over it.
  if (!referrer || referrer.id === referredStudentId) return null;

  // `referred` has a unique constraint, so this naturally guarantees each
  // student can only ever credit one referrer, exactly once.
  const { error: insertError } = await supabase
    .from('referrals')
    .insert({
      college_id: collegeId,
      referrer: referrer.id,
      referred: referredStudentId,
      status: 'confirmed',
    });

  if (insertError) {
    if (insertError.code !== '23505') {
      console.error('[applyReferral] failed to record referral', insertError);
    }
    return null; // already recorded, or a real failure -- either way, no-op
  }

  const { count } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer', referrer.id)
    .eq('status', 'confirmed');

  const referralCount = count ?? 0;

  // Milestone reward rows live in `rewards` with active=false (they're
  // deliberately excluded from claim-reward's random mystery-card pool --
  // see 0004_seed_kitsw_referral_milestones.sql) but are still valid,
  // named rewards we can hand out deterministically here.
  const { data: milestone } = await supabase
    .from('referral_milestones')
    .select('*, rewards(*)')
    .eq('college_id', collegeId)
    .eq('referral_count', referralCount)
    .eq('active', true)
    .maybeSingle();

  if (!milestone || !milestone.rewards) {
    return { referrerId: referrer.id, referralCount, milestoneHit: null };
  }

  // 1. Only allow "5% OFF" and "10% OFF" rewards to get coupons.
  const rewardTitle = milestone.rewards.title;
  const isAllowedReward = rewardTitle === '5% OFF' || rewardTitle === '10% OFF';
  if (!isAllowedReward) {
    console.log(`[applyReferral] Milestone reached for "${rewardTitle}", but only "5% OFF" and "10% OFF" rewards are allowed. Skipping coupon generation.`);
    return { referrerId: referrer.id, referralCount, milestoneHit: null };
  }

  // 2. Check total budget spent on referral milestone coupons so far for this college.
  // Milestone rewards have active = false.
  const { data: couponsList, error: spentError } = await supabase
    .from('coupons')
    .select('rewards!inner(max_discount_amount, active)')
    .eq('college_id', collegeId)
    .eq('rewards.active', false);

  let totalSpent = 0;
  if (spentError) {
    console.error('[applyReferral] failed to calculate spent budget', spentError);
  } else if (couponsList) {
    for (const c of couponsList) {
      totalSpent += Number(c.rewards?.max_discount_amount || 0);
    }
  }

  // 3. Enforce the budget cap (₹3,000)
  const nextCouponValue = Number(milestone.rewards.max_discount_amount || 0);
  if (totalSpent >= 3000 || totalSpent + nextCouponValue > 3000) {
    console.log(`[applyReferral] Budget cap of ₹3000 reached or would be exceeded (spent: ₹${totalSpent}, next: ₹${nextCouponValue}). Skipping coupon generation.`);
    return { referrerId: referrer.id, referralCount, milestoneHit: null };
  }

  const { data: college } = await supabase
    .from('colleges')
    .select('short_name')
    .eq('id', collegeId)
    .single();
  const prefix = (college?.short_name || 'ZDR').toUpperCase().replace(/[^A-Z0-9]/g, '');

  let coupon = null;
  for (let attempt = 0; attempt < 5 && !coupon; attempt++) {
    const candidateCode = `${prefix}-${randomCode(6)}`;
    const { data: inserted, error: couponError } = await supabase
      .from('coupons')
      .insert({
        college_id: collegeId,
        coupon_code: candidateCode,
        reward_id: milestone.reward_id,
        claimed: true,
        claimed_by: referrer.id,
        claimed_at: new Date().toISOString(),
      })
      .select('id, coupon_code')
      .single();

    if (!inserted && couponError?.code === '23505') continue;
    if (couponError) {
      console.error('[applyReferral] failed to create milestone coupon', couponError);
      return { referrerId: referrer.id, referralCount, milestoneHit: null };
    }
    coupon = inserted;
  }

  if (!coupon) {
    return { referrerId: referrer.id, referralCount, milestoneHit: null };
  }

  await notifyReferrer(referrer.id, milestone.rewards, coupon.coupon_code);

  return {
    referrerId: referrer.id,
    referralCount,
    milestoneHit: {
      referralCount: milestone.referral_count,
      rewardTitle: milestone.rewards.title,
      couponCode: coupon.coupon_code,
    },
  };
}
