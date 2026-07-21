// supabase/functions/admin-rewards
//
// POST body: { action: 'list' | 'create' | 'update', ... }
//
// - list: { collegeId } -> all rewards for that college, plus the current
//   sum of active (mystery-card pool) probabilities so the admin UI can
//   warn if it doesn't add up to 1.
// - create/update: { collegeId, rewardId?, title, description, rewardType,
//     rewardValue, minOrderValue, maxDiscountAmount, probability, active }
//
// Reminder for context: rewards with active=false are milestone/referral
// rewards, deliberately excluded from claim-reward's random pool (see
// 0004_seed_kitsw_referral_milestones.sql). This function lets you edit
// both kinds -- just be aware what flipping `active` does.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/adminAuth.ts';

async function activeProbabilitySum(supabase, collegeId) {
  const { data } = await supabase
    .from('rewards')
    .select('probability')
    .eq('college_id', collegeId)
    .eq('active', true);
  return (data || []).reduce((sum, r) => sum + Number(r.probability), 0);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  const { user, error: authError, status: authStatus } = await requireAdmin(req, supabase);
  if (!user) return jsonResponse({ error: authError }, authStatus);

  try {
    const body = await req.json();
    const { action, collegeId } = body;
    if (!collegeId) return jsonResponse({ error: 'collegeId is required' }, 400);

    if (action === 'list') {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('college_id', collegeId)
        .order('active', { ascending: false })
        .order('probability', { ascending: false });
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ rewards: data, activeProbabilitySum: await activeProbabilitySum(supabase, collegeId) });
    }

    if (action === 'create' || action === 'update') {
      const { rewardId, title, description, rewardType, rewardValue, minOrderValue, maxDiscountAmount, probability, active } = body;
      if (!title || rewardValue === undefined || minOrderValue === undefined || probability === undefined) {
        return jsonResponse({ error: 'title, rewardValue, minOrderValue, and probability are required' }, 400);
      }

      const payload = {
        college_id: collegeId,
        title,
        description: description || null,
        reward_type: rewardType || 'percentage_discount',
        reward_value: rewardValue,
        min_order_value: minOrderValue,
        max_discount_amount: maxDiscountAmount ?? null,
        probability,
        active: active ?? true,
      };

      let result;
      if (action === 'create') {
        result = await supabase.from('rewards').insert(payload).select('*').single();
      } else {
        if (!rewardId) return jsonResponse({ error: 'rewardId is required for update' }, 400);
        result = await supabase.from('rewards').update(payload).eq('id', rewardId).select('*').single();
      }
      if (result.error) return jsonResponse({ error: result.error.message }, 500);

      return jsonResponse({ reward: result.data, activeProbabilitySum: await activeProbabilitySum(supabase, collegeId) });
    }

    return jsonResponse({ error: `Unknown action "${action}"` }, 400);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
