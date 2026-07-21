-- ============================================================================
-- Zordr Pre-Launch Growth Platform — Phase 1 schema
-- Run this in Supabase SQL Editor (or `supabase db push` once CLI is linked).
-- ============================================================================

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ----------------------------------------------------------------------------
-- colleges
-- One row per campus. The frontend loads this by slug and drives every
-- page from it. No college-specific data may live in frontend code.
-- ----------------------------------------------------------------------------
create table colleges (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  short_name          text not null,
  slug                text not null unique,
  logo_url            text,
  hero_image_url      text,
  theme               jsonb not null default '{}'::jsonb, -- e.g. {"primary": "#FF5A1F"}
  launch_date         timestamptz,
  campaign_status     text not null default 'draft' check (campaign_status in ('draft', 'live', 'paused', 'ended')),
  early_bird_limit    integer not null default 500,
  signup_reward_note  text,      -- short marketing copy, e.g. "Launch week rewards"
  referral_reward_note text,
  social_links        jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

create index idx_colleges_slug on colleges (slug);

-- current_signup_count is intentionally NOT a stored column — it's derived
-- live from `students` so it can never drift out of sync. See the view below.

-- ----------------------------------------------------------------------------
-- students (Early Bird signups)
-- ----------------------------------------------------------------------------
create table students (
  id            uuid primary key default gen_random_uuid(),
  college_id    uuid not null references colleges(id) on delete cascade,
  name          text not null,
  email         text not null,
  phone         text not null,
  branch        text,
  year          text,
  hosteller     boolean,
  referral_code text not null unique,
  referred_by   text references students(referral_code),
  reward_id     uuid,                            -- FK added below via ALTER TABLE, once `rewards` exists
  coupon_id     uuid,                            -- FK added below via ALTER TABLE, once `coupons` exists
  status        text not null default 'signed_up' check (status in ('signed_up', 'reward_claimed')),
  created_at    timestamptz not null default now(),
  unique (college_id, email),
  unique (college_id, phone)
);

-- ----------------------------------------------------------------------------
-- rewards (the 5 mystery-card tiers, fully configurable per college)
-- Never selectable by the anon client — only Edge Functions (service role)
-- read this table. The frontend must never know reward odds or values.
-- ----------------------------------------------------------------------------
create table rewards (
  id                 uuid primary key default gen_random_uuid(),
  college_id         uuid not null references colleges(id) on delete cascade,
  title              text not null,          -- "5% OFF"
  description        text,                   -- "on bills above ₹50"
  reward_type        text not null default 'percentage_discount',
  reward_value       numeric not null,       -- percentage, e.g. 5, 10, 15, 20, 50
  min_order_value    numeric not null,       -- ₹ minimum bill to use the coupon
  max_discount_amount numeric,               -- ₹ cap on the discount (null = uncapped)
  probability         numeric not null,      -- 0–1, must sum to 1 per college
  active               boolean not null default true,
  created_at           timestamptz not null default now()
);

create index idx_rewards_college on rewards (college_id);

-- ----------------------------------------------------------------------------
-- coupons (individual redeemable codes, one gets reserved per student)
-- Never selectable by the anon client.
-- ----------------------------------------------------------------------------
create table coupons (
  id            uuid primary key default gen_random_uuid(),
  college_id    uuid not null references colleges(id) on delete cascade,
  coupon_code   text not null unique,
  reward_id     uuid not null references rewards(id) on delete cascade,
  claimed       boolean not null default false,
  claimed_by    uuid references students(id),
  claimed_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_coupons_reward on coupons (reward_id);
create index idx_coupons_unclaimed on coupons (reward_id) where claimed = false;

-- Now that rewards/coupons exist, wire up the forward references on students.
alter table students
  add constraint fk_students_reward foreign key (reward_id) references rewards(id),
  add constraint fk_students_coupon foreign key (coupon_id) references coupons(id);

-- ----------------------------------------------------------------------------
-- referrals
-- ----------------------------------------------------------------------------
create table referrals (
  id            uuid primary key default gen_random_uuid(),
  college_id    uuid not null references colleges(id) on delete cascade,
  referrer      uuid not null references students(id) on delete cascade,
  referred      uuid not null references students(id) on delete cascade,
  status        text not null default 'pending' check (status in ('pending', 'confirmed')),
  reward_given  boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (referred) -- a student can only be credited as someone's referral once
);

create index idx_referrals_referrer on referrals (referrer);

-- ----------------------------------------------------------------------------
-- referral_milestones (configurable "N referrals -> reward" ladder, per PRD)
-- ----------------------------------------------------------------------------
create table referral_milestones (
  id             uuid primary key default gen_random_uuid(),
  college_id     uuid not null references colleges(id) on delete cascade,
  referral_count integer not null,      -- 1, 3, 5, 10 ...
  reward_id      uuid references rewards(id),
  active         boolean not null default true,
  unique (college_id, referral_count)
);

-- ----------------------------------------------------------------------------
-- insider_applications (Campus Insider signups)
-- ----------------------------------------------------------------------------
create table insider_applications (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  college_id   uuid not null references colleges(id) on delete cascade,
  role         text not null,
  answers      jsonb not null default '{}'::jsonb, -- dynamic_form_fields responses
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- dynamic_form_fields (Campus Insider's "Additional Questions", admin-configurable)
-- ----------------------------------------------------------------------------
create table dynamic_form_fields (
  id             uuid primary key default gen_random_uuid(),
  college_id     uuid not null references colleges(id) on delete cascade,
  label          text not null,
  type           text not null check (type in ('text', 'textarea', 'select', 'radio', 'checkbox')),
  options        jsonb,             -- for select/radio/checkbox: ["Option A", "Option B"]
  required       boolean not null default false,
  display_order  integer not null default 0
);

create index idx_form_fields_college on dynamic_form_fields (college_id, display_order);

-- ----------------------------------------------------------------------------
-- Public-safe view: what the landing page is allowed to see about counts.
-- Keeps raw `students` table (with emails/phones) out of anon reach entirely.
-- ----------------------------------------------------------------------------
create view college_public_stats as
select
  c.id as college_id,
  c.slug,
  c.early_bird_limit,
  count(s.id) as current_signup_count
from colleges c
left join students s on s.college_id = c.id
group by c.id, c.slug, c.early_bird_limit;

-- ============================================================================
-- Row Level Security
--
-- Per the PRD's security rules: reward allocation, coupon assignment, and
-- referral validation must only ever happen in Edge Functions. Edge
-- Functions use the service_role key, which bypasses RLS entirely — so
-- everything below is about what the *anon* (browser) key is allowed to
-- touch directly. Answer: almost nothing. Writes go through Edge Functions;
-- the only direct anon reads are public marketing config.
-- ============================================================================

alter table colleges enable row level security;
alter table students enable row level security;
alter table rewards enable row level security;
alter table coupons enable row level security;
alter table referrals enable row level security;
alter table referral_milestones enable row level security;
alter table insider_applications enable row level security;
alter table dynamic_form_fields enable row level security;

-- Public, read-only marketing config — safe for anon.
create policy "colleges are publicly readable"
  on colleges for select
  using (true);

create policy "dynamic form fields are publicly readable"
  on dynamic_form_fields for select
  using (true);

-- Everything else (students, rewards, coupons, referrals, milestones,
-- insider_applications) gets NO policy at all for anon, meaning zero
-- direct access from the browser in any direction. All reads/writes for
-- these happen inside Edge Functions (createStudent, assignReward,
-- reserveCoupon, sendReward, applyReferral, submitCampusInsider — Phase 2).

grant select on college_public_stats to anon, authenticated;
