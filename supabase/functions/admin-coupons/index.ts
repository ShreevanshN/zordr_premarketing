// supabase/functions/admin-coupons
//
// POST body: { action: 'markSynced', collegeId, couponCode }
//
// Marks an issued coupon as added to the mobile app. After admin copies
// a ledger code into the Zordr app's coupon system, they hit "Update"
// so the ledger reflects that students can redeem it.
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
    const body = await req.json();
    const { action } = body;

    if (action === 'markSynced') {
      const { collegeId, couponCode } = body;
      if (!collegeId || !couponCode) {
        return jsonResponse({ error: 'collegeId and couponCode are required' }, 400);
      }

      const { data, error } = await supabase
        .from('coupons')
        .update({ app_synced: true, app_synced_at: new Date().toISOString() })
        .eq('college_id', collegeId)
        .eq('coupon_code', couponCode)
        .select('coupon_code, app_synced, app_synced_at')
        .maybeSingle();

      if (error) return jsonResponse({ error: error.message }, 500);
      if (!data) return jsonResponse({ error: 'Coupon not found for this college' }, 404);
      return jsonResponse({ coupon: data });
    }

    return jsonResponse({ error: `Unknown action "${action}"` }, 400);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
