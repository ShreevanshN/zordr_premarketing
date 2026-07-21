// supabase/functions/admin-applications
//
// POST body: { action: 'list' | 'updateStatus', ... }
//
// - list: { collegeId, status? } -> insider_applications joined with the
//   applicant's contact info (name/email/phone) -- legitimate use of the
//   service-role client bypassing RLS here, since this is now behind real
//   admin auth. Public/anon access to this data is still fully blocked.
// - updateStatus: { applicationId, status: 'accepted' | 'rejected' | 'pending' }
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

    if (action === 'list') {
      const { collegeId, status } = body;
      if (!collegeId) return jsonResponse({ error: 'collegeId is required' }, 400);

      let query = supabase
        .from('insider_applications')
        .select('id, role, answers, status, created_at, students(name, email, phone, branch, year, hosteller, referral_code)')
        .eq('college_id', collegeId)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ applications: data });
    }

    if (action === 'updateStatus') {
      const { applicationId, status } = body;
      if (!applicationId || !status) return jsonResponse({ error: 'applicationId and status are required' }, 400);
      if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return jsonResponse({ error: 'status must be pending, accepted, or rejected' }, 400);
      }
      const { data, error } = await supabase
        .from('insider_applications')
        .update({ status })
        .eq('id', applicationId)
        .select('id, status')
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ application: data });
    }

    return jsonResponse({ error: `Unknown action "${action}"` }, 400);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
