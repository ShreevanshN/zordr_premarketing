// supabase/functions/admin-early-birds
//
// POST body: { collegeId?: string }
//
// Returns a list of all registered students, including name, phone, device_type,
// claimed coupon code, and discount offer.
// Gated by requireAdmin().
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
    const { collegeId } = body;

    let query = supabase
      .from('students')
      .select(`
        id,
        name,
        phone,
        device_type,
        created_at,
        colleges!college_id (
          id,
          name,
          short_name
        ),
        coupons!coupon_id (
          coupon_code
        ),
        rewards!reward_id (
          title,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (collegeId) {
      query = query.eq('college_id', collegeId);
    }

    const { data: students, error } = await query;
    if (error) return jsonResponse({ error: error.message }, 500);

    return jsonResponse({ students });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
