// supabase/functions/admin-analytics
//
// POST body: { collegeId }
//
// Returns everything the admin dashboard's overview needs in one call:
// signup totals + a daily trend, reward distribution (what's actually
// being handed out), referral totals, insider application counts by
// status, and a coupon ledger (since there's no fixed pool to "upload" --
// coupons are generated per-claim -- this ledger is the practical
// substitute: see every code that's been issued, to whom, and for what).
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/adminAuth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  const { user, error: authError, status: authStatus } = await requireAdmin(req, supabase);
  if (!user) return jsonResponse({ error: authError }, authStatus);

  try {
    const { collegeId } = await req.json();
    if (!collegeId) return jsonResponse({ error: 'collegeId is required' }, 400);

    const { data: college } = await supabase.from('colleges').select('*').eq('id', collegeId).maybeSingle();
    if (!college) return jsonResponse({ error: 'College not found' }, 404);

    const { data: students } = await supabase
      .from('students')
      .select('id, created_at, reward_id')
      .eq('college_id', collegeId);

    const totalSignups = students?.length || 0;
    const totalRewardsClaimed = (students || []).filter(s => s.reward_id).length;

    // Daily signup trend, last 14 days.
    const dayBuckets = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayBuckets[d.toISOString().slice(0, 10)] = 0;
    }
    (students || []).forEach(s => {
      const day = s.created_at?.slice(0, 10);
      if (day in dayBuckets) dayBuckets[day] += 1;
    });
    const signupTrend = Object.entries(dayBuckets).map(([date, count]) => ({ date, count }));

    // Reward distribution: how many coupons issued per reward title.
    const { data: coupons } = await supabase
      .from('coupons')
      .select('coupon_code, claimed_at, claimed_by, app_synced, app_synced_at, rewards(title, active)')
      .eq('college_id', collegeId)
      .order('claimed_at', { ascending: false });

    const distributionMap = new Map();
    (coupons || []).forEach(c => {
      const title = c.rewards?.title || 'Unknown';
      distributionMap.set(title, (distributionMap.get(title) || 0) + 1);
    });
    const rewardDistribution = Array.from(distributionMap.entries()).map(([title, count]) => ({ title, count }));

    // Referrals
    const { count: totalReferrals } = await supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('college_id', collegeId)
      .eq('status', 'confirmed');

    return jsonResponse({
      college: {
        name: college.name,
        campaignStatus: college.campaign_status,
        earlyBirdLimit: college.early_bird_limit,
      },
      totalSignups,
      totalRewardsClaimed,
      signupTrend,
      rewardDistribution,
      totalReferrals: totalReferrals ?? 0,
      couponLedger: (coupons || []).slice(0, 100).map(c => ({
        code: c.coupon_code,
        rewardTitle: c.rewards?.title,
        claimedAt: c.claimed_at,
        appSynced: c.app_synced === true,
        appSyncedAt: c.app_synced_at,
      })),
    });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
