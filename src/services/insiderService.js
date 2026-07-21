import { supabase } from '../lib/supabase';
import { getStudentSession } from './studentService';

/**
 * Submits (or resumes) a Campus Insider application for the current
 * browser's signed-up student.
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export async function submitCampusInsider(slug, { role, branch, year, hosteller, reason, answers }) {
  const session = getStudentSession(slug);
  if (!session?.studentId) {
    return { data: null, error: 'No signup found for this session -- please sign up as an Early Bird first.' };
  }

  const { data, error } = await supabase.functions.invoke('submit-campus-insider', {
    body: { studentId: session.studentId, role, branch, year, hosteller, reason, answers },
  });

  if (error) return { data: null, error: error.message || 'Could not submit your application right now' };
  if (data?.error) return { data: null, error: data.error };

  return { data, error: null };
}
