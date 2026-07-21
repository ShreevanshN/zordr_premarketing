// supabase/functions/submit-campus-insider
//
// POST body: {
//   studentId: string,
//   role: string,
//   branch: string,
//   year: string,
//   hosteller: boolean,
//   reason: string,
//   answers?: { [fieldId: string]: string }   // dynamic_form_fields responses
// }
//
// - Requires an existing student (they must have already signed up as an
//   Early Bird -- this form auto-fills from that record, per the PRD).
// - Updates the student's branch/year/hosteller (these live on `students`,
//   not duplicated into the application row).
// - Idempotent: resubmitting returns the existing application instead of
//   creating a duplicate.
// - `reason` (the fixed "why do you want to join" question) is stored
//   inside `answers` alongside the dynamic per-college questions, since the
//   PRD's insider_applications table only has one `answers` jsonb column.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const VALID_ROLES = ['Growth Lead', 'Community Lead', 'Product Insider'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { studentId, role, branch, year, hosteller, reason, answers } = await req.json();

    if (!studentId || !role || !branch || !year || typeof hosteller !== 'boolean' || !reason) {
      return jsonResponse(
        { error: 'studentId, role, branch, year, hosteller, and reason are all required' },
        400
      );
    }
    if (!VALID_ROLES.includes(role)) {
      return jsonResponse({ error: 'Invalid role' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, college_id')
      .eq('id', studentId)
      .maybeSingle();

    if (studentError) return jsonResponse({ error: studentError.message }, 500);
    if (!student) return jsonResponse({ error: 'Student not found -- please sign up first' }, 404);

    // Idempotent: already applied? Return that instead of duplicating.
    const { data: existingApp } = await supabase
      .from('insider_applications')
      .select('id, role, status, created_at')
      .eq('student_id', studentId)
      .maybeSingle();

    if (existingApp) {
      return jsonResponse({
        applicationId: existingApp.id,
        role: existingApp.role,
        status: existingApp.status,
        alreadyApplied: true,
      });
    }

    // Only fetch the college's active dynamic fields to validate `answers`
    // keys against real field IDs -- prevents arbitrary junk being stuffed
    // into the jsonb blob.
    const { data: fields } = await supabase
      .from('dynamic_form_fields')
      .select('id, required, label')
      .eq('college_id', student.college_id);

    const validFieldIds = new Set((fields || []).map(f => f.id));
    const cleanAnswers = {};
    for (const [key, value] of Object.entries(answers || {})) {
      if (validFieldIds.has(key)) cleanAnswers[key] = value;
    }

    const missingRequired = (fields || []).filter(
      f => f.required && !cleanAnswers[f.id]
    );
    if (missingRequired.length > 0) {
      return jsonResponse(
        { error: `Missing required answer${missingRequired.length > 1 ? 's' : ''}: ${missingRequired.map(f => f.label).join(', ')}` },
        400
      );
    }

    const { error: updateError } = await supabase
      .from('students')
      .update({ branch, year, hosteller })
      .eq('id', studentId);
    if (updateError) return jsonResponse({ error: updateError.message }, 500);

    const { data: application, error: insertError } = await supabase
      .from('insider_applications')
      .insert({
        student_id: studentId,
        college_id: student.college_id,
        role,
        answers: { reason, ...cleanAnswers },
        status: 'pending',
      })
      .select('id, status')
      .single();

    if (insertError) return jsonResponse({ error: insertError.message }, 500);

    return jsonResponse({
      applicationId: application.id,
      role,
      status: application.status,
      alreadyApplied: false,
    });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
