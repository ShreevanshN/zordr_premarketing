import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AdminAuthContext = createContext(null);

/**
 * Real Supabase Auth session for the admin console. Deliberately separate
 * from the Employee/Insider Portal's AuthContext (which is mock/localStorage
 * and left untouched, per current scope) -- this one gates actual write
 * access to campaign config, so it has to be real.
 *
 * Being logged in here is necessary but not sufficient: every admin-*
 * Edge Function also checks the `admins` allowlist table server-side. This
 * context only tracks "is there a session at all" for routing/UX; the
 * source of truth for authorization is always the server.
 */
export const AdminAuthProvider = ({ children }) => {
  const [session, setSession] = useState(undefined); // undefined = still checking, null = signed out

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const login = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const logout = () => supabase.auth.signOut();

  return (
    <AdminAuthContext.Provider value={{ session, loading: session === undefined, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
