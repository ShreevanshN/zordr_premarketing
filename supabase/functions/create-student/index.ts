// supabase/functions/create-student
//
// POST body: { collegeSlug: string, name: string, email: string, phone: string, ref?: string }
//
// - Looks up the college by slug.
// - Generates the referral code server-side (never trust the client for this).
// - If this email/phone already signed up for this college, returns their
//   existing referral code instead of erroring — resubmitting the form
//   (e.g. after a refresh) shouldn't dead-end the student.
// - Validates a `ref` code against real students so `referred_by` only ever
//   stores a code that actually exists (referral crediting/milestones are
//   Phase 4 — this just captures the data now so nothing is lost).
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { applyReferral } from '../_shared/referrals.ts';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion

function randomCode(length = 5) {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { collegeSlug, name, email, phone, ref, deviceType } = await req.json();

    if (!collegeSlug || !name || !email || !phone) {
      return jsonResponse({ error: 'collegeSlug, name, email, and phone are required' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('id, short_name, campaign_status, early_bird_limit')
      .eq('slug', collegeSlug)
      .maybeSingle();

    if (collegeError) return jsonResponse({ error: collegeError.message }, 500);
    if (!college) return jsonResponse({ error: 'Unknown college' }, 404);
    if (college.campaign_status !== 'live') {
      return jsonResponse({ error: 'This campaign is not currently accepting signups' }, 403);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    // Idempotent resubmission: if they already signed up, hand back their
    // existing referral code instead of throwing a duplicate error.
    const { data: existing } = await supabase
      .from('students')
      .select('id, referral_code, reward_id')
      .eq('college_id', college.id)
      .or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`)
      .maybeSingle();

    if (existing) {
      return jsonResponse({
        studentId: existing.id,
        referralCode: existing.referral_code,
        alreadyRegistered: true,
        hasClaimedReward: !!existing.reward_id,
      });
    }

    // Validate the referral code, if one was passed in the URL (?ref=...).
    let referredBy = null;
    if (ref) {
      const { data: referrer } = await supabase
        .from('students')
        .select('referral_code')
        .eq('college_id', college.id)
        .eq('referral_code', String(ref).trim().toUpperCase())
        .maybeSingle();
      if (referrer) referredBy = referrer.referral_code;
    }

    // Generate a unique referral code, retrying on the rare collision.
    const prefix = (college.short_name || collegeSlug).toUpperCase().replace(/[^A-Z0-9]/g, '');
    let referralCode = null;
    let studentId = null;

    for (let attempt = 0; attempt < 5 && !studentId; attempt++) {
      const candidate = `${prefix}-${randomCode(5)}`;
      const { data: inserted, error: insertError } = await supabase
        .from('students')
        .insert({
          college_id: college.id,
          name: String(name).trim(),
          email: cleanEmail,
          phone: cleanPhone,
          referral_code: candidate,
          referred_by: referredBy,
          device_type: deviceType || null,
        })
        .select('id, referral_code')
        .single();

      if (!insertError) {
        studentId = inserted.id;
        referralCode = inserted.referral_code;
        break;
      }

      // 23505 = unique_violation. Only retry if it was the referral_code
      // collision — a real email/phone collision means someone else signed
      // up in the split second since our check above, so surface that.
      if (insertError.code === '23505' && insertError.message.includes('referral_code')) {
        continue;
      }
      if (insertError.code === '23505') {
        return jsonResponse({ error: 'This email or phone is already registered for this campaign' }, 409);
      }
      return jsonResponse({ error: insertError.message }, 500);
    }

    if (!studentId) {
      return jsonResponse({ error: 'Could not generate a unique referral code, please try again' }, 500);
    }

    // Credit the referrer, if this signup came in through a valid ?ref=
    // link. Deliberately fire-and-forget-safe: if this fails for any
    // reason, the student's own signup has already succeeded and shouldn't
    // be rolled back over it -- applyReferral() only logs on failure.
    if (referredBy) {
      await applyReferral(supabase, { collegeId: college.id, referrerCode: referredBy, referredStudentId: studentId });
    }

    return jsonResponse({ studentId, referralCode, alreadyRegistered: false, hasClaimedReward: false });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
