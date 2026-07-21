-- ============================================================================
-- Seed: KITSW referral milestones (1 / 3 / 5 / 10 referrals) + a leaderboard
-- view for the referral dashboard.
--
-- IMPORTANT: unlike the mystery-card tiers in 0002 (which you gave exact
-- values for), you didn't specify what these referral rewards should be.
-- The values below are PLACEHOLDERS so the feature is testable end-to-end
-- -- swap them for real numbers whenever you're ready, it's just a table
-- edit, no code changes needed.
--
-- These reward rows use active=false deliberately: claim-reward's random
-- mystery-card pool only pulls active=true rewards, so milestone rewards
-- never leak into that pool. applyReferral() (in the Edge Functions) looks
-- these up directly by ID via referral_milestones, ignoring the active
-- flag -- "active" here means "in the random rotation", not "enabled".
-- ============================================================================

do $$
declare
  v_college_id uuid;
  v_reward_1 uuid;
  v_reward_3 uuid;
  v_reward_5 uuid;
  v_reward_10 uuid;
begin
  select id into v_college_id from colleges where slug = 'kitsw';

  insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
  values (v_college_id, '10% OFF', 'Referral reward -- on bills above ₹100', 'percentage_discount', 10, 100, 15, 0, false)
  returning id into v_reward_1;

  insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
  values (v_college_id, '20% OFF', 'Referral reward -- on bills above ₹150', 'percentage_discount', 20, 150, 40, 0, false)
  returning id into v_reward_3;

  insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
  values (v_college_id, '30% OFF', 'Referral reward -- on bills above ₹200', 'percentage_discount', 30, 200, 75, 0, false)
  returning id into v_reward_5;

  insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
  values (v_college_id, '50% OFF', 'Referral reward -- on bills above ₹250, up to ₹200 off', 'percentage_discount', 50, 250, 200, 0, false)
  returning id into v_reward_10;

  insert into referral_milestones (college_id, referral_count, reward_id, active) values
    (v_college_id, 1, v_reward_1, true),
    (v_college_id, 3, v_reward_3, true),
    (v_college_id, 5, v_reward_5, true),
    (v_college_id, 10, v_reward_10, true);
end $$;

-- ----------------------------------------------------------------------------
-- Leaderboard view -- powers the "Top Sharers" dashboard. Not anon-readable
-- (only service_role, via the get-referral-stats Edge Function), same
-- reasoning as the rest of Phase 1/2/3's locked-down tables.
-- ----------------------------------------------------------------------------
create view referral_leaderboard as
select
  s.id as student_id,
  s.college_id,
  s.name,
  count(r.id) as referral_count
from students s
join referrals r on r.referrer = s.id and r.status = 'confirmed'
group by s.id, s.college_id, s.name;

grant select on referral_leaderboard to service_role;
