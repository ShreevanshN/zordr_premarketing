import { supabase } from '../lib/supabase';
import { getStudentSession } from './studentService';

/**
 * Pulls the current student's referral count, milestone ladder progress,
 * and college leaderboard.
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export async function getReferralStats(slug) {
  const session = getStudentSession(slug);
  if (!session?.studentId) {
    return { data: null, error: 'No signup found for this session' };
  }

  const { data, error } = await supabase.functions.invoke('get-referral-stats', {
    body: { studentId: session.studentId },
  });

  if (error) return { data: null, error: error.message || 'Could not load referral stats right now' };
  if (data?.error) return { data: null, error: data.error };

  return { data, error: null };
}
