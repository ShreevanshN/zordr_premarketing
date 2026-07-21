// Verifies the caller has a valid Supabase Auth session AND is on the
// `admins` allowlist. Every admin-* Edge Function calls this first, before
// touching anything.
export async function requireAdmin(req, supabase) {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return { user: null, error: 'Missing authorization', status: 401 };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { user: null, error: 'Invalid or expired session', status: 401 };
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!admin) {
    return { user: null, error: 'Not authorized as an admin', status: 403 };
  }

  return { user, error: null, status: 200 };
}
