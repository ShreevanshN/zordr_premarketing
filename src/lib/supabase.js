import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Don't throw at import time — some pages (e.g. the old Employee Portal,
  // which currently runs on localStorage/mock auth) can still function
  // without Supabase configured. Log loudly instead so misconfiguration
  // is obvious in dev without hard-crashing the whole app.
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. ' +
    'Copy .env.example to .env.local and fill in your project credentials.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);
