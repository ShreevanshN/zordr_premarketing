-- ============================================================================
-- Admin console auth. Real Supabase Auth (email/password), gated by an
-- explicit allowlist -- being a valid logged-in user is NOT enough to
-- manage campaigns, you also need a row here.
--
-- Bootstrapping the first admin (no self-registration UI, deliberately --
-- keeps the surface area small for what's presumably a couple of trusted
-- people):
--   1. Supabase Dashboard -> Authentication -> Add User -> create yourself
--      an email/password user.
--   2. Copy that user's UUID, then run:
--        insert into admins (id, email) values ('<uuid>', 'you@zordr.in');
-- ============================================================================

create table admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;
-- No anon/authenticated policies at all -- not even a logged-in admin can
-- SELECT this table directly from the browser. Every check happens
-- server-side in Edge Functions via the service-role client, so a
-- non-admin can't even probe who the admins are.
