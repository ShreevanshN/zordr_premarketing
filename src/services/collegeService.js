import { supabase } from '../lib/supabase';

/**
 * Loads a college's public config by its URL slug (e.g. "kitsw"), plus the
 * live signup count derived from the `college_public_stats` view.
 *
 * This queries Supabase directly because `colleges` is intentionally
 * public-readable (see RLS policy in 0001_init_schema.sql) — it's just
 * marketing config, not sensitive data. Everything that touches students,
 * rewards, or coupons goes through Edge Functions instead (Phase 2).
 *
 * @param {string} slug
 * @returns {Promise<{ college: object, error: string|null }>}
 */
export async function getCollegeBySlug(slug) {
  if (!slug) {
    return { college: null, error: 'No college slug provided' };
  }

  const { data: college, error: collegeError } = await supabase
    .from('colleges')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (collegeError) {
    return { college: null, error: collegeError.message };
  }

  if (!college) {
    return { college: null, error: 'not_found' };
  }

  const { data: stats } = await supabase
    .from('college_public_stats')
    .select('current_signup_count')
    .eq('college_id', college.id)
    .maybeSingle();

  return {
    college: {
      ...college,
      current_signup_count: stats?.current_signup_count ?? 0,
    },
    error: null,
  };
}


