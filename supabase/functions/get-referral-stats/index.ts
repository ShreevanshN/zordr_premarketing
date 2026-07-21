// supabase/functions/get-referral-stats
//
// POST body: { studentId: string }
//
// Returns everything the success page's referral dashboard needs:
// - how many confirmed referrals this student has
// - the full milestone ladder for their college, with which ones they've
//   already hit (and the coupon code they earned for each)
// - a top-5 leaderboard for their college
//
// This exists because `students`/`referrals`/`coupons` have zero anon RLS
// access by design (see Phase 1 notes) -- this is the one narrow, read-only
// summary the frontend is allowed to pull, and it only returns aggregate
// counts + a first name for the leaderboard, never raw student rows.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

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
      .select('id, college_id, referral_code')
      .eq('id', studentId)
      .maybeSingle();

    if (studentError) return jsonResponse({ error: studentError.message }, 500);
    if (!student) return jsonResponse({ error: 'Student not found' }, 404);

    const { count } = await supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer', studentId)
      .eq('status', 'confirmed');
    const referralCount = count ?? 0;

    const { data: milestones } = await supabase
      .from('referral_milestones')
      .select('referral_count, rewards(title, description)')
      .eq('college_id', student.college_id)
      .eq('active', true)
      .order('referral_count', { ascending: true });

    // Every coupon this student has ever earned via referrals (one per
    // milestone crossed), so we can show the actual code next to each
    // achieved tier instead of just a checkmark.
    const { data: milestoneCoupons } = await supabase
      .from('coupons')
      .select('coupon_code, rewards(title)')
      .eq('claimed_by', studentId);

    const couponByRewardTitle = new Map((milestoneCoupons || []).map(c => [c.rewards?.title, c.coupon_code]));

    const ladder = (milestones || []).map(m => ({
      referralCount: m.referral_count,
      rewardTitle: m.rewards?.title,
      rewardDescription: m.rewards?.description,
      achieved: referralCount >= m.referral_count,
      couponCode: referralCount >= m.referral_count ? couponByRewardTitle.get(m.rewards?.title) || null : null,
    }));

    const { data: leaderboardRows } = await supabase
      .from('referral_leaderboard')
      .select('name, referral_count')
      .eq('college_id', student.college_id)
      .order('referral_count', { ascending: false })
      .limit(5);

    const leaderboard = (leaderboardRows || []).map(r => ({
      firstName: (r.name || '').trim().split(/\s+/)[0] || 'Anonymous',
      referralCount: r.referral_count,
    }));

    return jsonResponse({
      referralCode: student.referral_code,
      referralCount,
      milestones: ladder,
      leaderboard,
    });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
