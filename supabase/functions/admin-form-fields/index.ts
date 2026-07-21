// supabase/functions/admin-form-fields
//
// POST body: { action: 'list' | 'create' | 'update' | 'delete', ... }
//
// Manages the dynamic_form_fields table -- the "Additional Questions" on
// the Campus Insider form. Adding a new question is just a DB row; no
// frontend code changes needed (CampusInsider.jsx already renders whatever
// it finds here).
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/adminAuth.ts';

const VALID_TYPES = ['text', 'textarea', 'select', 'radio', 'checkbox'];

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

    if (action === 'list') {
      if (!collegeId) return jsonResponse({ error: 'collegeId is required' }, 400);
      const { data, error } = await supabase
        .from('dynamic_form_fields')
        .select('*')
        .eq('college_id', collegeId)
        .order('display_order', { ascending: true });
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ fields: data });
    }

    if (action === 'create' || action === 'update') {
      const { fieldId, label, type, options, required, displayOrder } = body;
      if (!collegeId) return jsonResponse({ error: 'collegeId is required' }, 400);
      if (!label || !type) return jsonResponse({ error: 'label and type are required' }, 400);
      if (!VALID_TYPES.includes(type)) return jsonResponse({ error: `type must be one of: ${VALID_TYPES.join(', ')}` }, 400);
      if ((type === 'select' || type === 'radio') && (!options || options.length === 0)) {
        return jsonResponse({ error: `${type} fields need at least one option` }, 400);
      }

      const payload = {
        college_id: collegeId,
        label,
        type,
        options: options && options.length > 0 ? options : null,
        required: !!required,
        display_order: displayOrder ?? 0,
      };

      let result;
      if (action === 'create') {
        result = await supabase.from('dynamic_form_fields').insert(payload).select('*').single();
      } else {
        if (!fieldId) return jsonResponse({ error: 'fieldId is required for update' }, 400);
        result = await supabase.from('dynamic_form_fields').update(payload).eq('id', fieldId).select('*').single();
      }
      if (result.error) return jsonResponse({ error: result.error.message }, 500);
      return jsonResponse({ field: result.data });
    }

    if (action === 'delete') {
      const { fieldId } = body;
      if (!fieldId) return jsonResponse({ error: 'fieldId is required' }, 400);
      const { error } = await supabase.from('dynamic_form_fields').delete().eq('id', fieldId);
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ deleted: true });
    }

    return jsonResponse({ error: `Unknown action "${action}"` }, 400);
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
