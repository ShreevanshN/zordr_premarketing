// supabase/functions/apply-referral
//
// POST body: { studentId: string }   // the REFERRED student's id
//
// Normally referral crediting happens automatically inside create-student
// at signup time. This standalone endpoint exists for the reprocessing
// case the PRD implies with a dedicated applyReferral() function -- e.g.
// an admin fixes a mistyped ?ref= code after the fact and wants to credit
// it retroactively. Safe to call multiple times: applyReferral() is
// idempotent (the `referred` unique constraint prevents double-crediting).
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { applyReferral } from '../_shared/referrals.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { studentId, referrerCode } = await req.json();
    if (!studentId) return jsonResponse({ error: 'studentId is required' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, college_id, referred_by')
      .eq('id', studentId)
      .maybeSingle();

    if (studentError) return jsonResponse({ error: studentError.message }, 500);
    if (!student) return jsonResponse({ error: 'Student not found' }, 404);

    const codeToApply = referrerCode || student.referred_by;
    if (!codeToApply) return jsonResponse({ error: 'No referral code to apply -- this student was not referred' }, 400);

    const result = await applyReferral(supabase, {
      collegeId: student.college_id,
      referrerCode: codeToApply,
      referredStudentId: student.id,
    });

    if (!result) {
      return jsonResponse({ applied: false, reason: 'Invalid code, self-referral, or already recorded' });
    }
    return jsonResponse({ applied: true, ...result });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
