-- ============================================================================
-- Seed: KITSW launch config + the 5 reward tiers we designed.
-- Budget check: ₹5,000 for 500 signups → ₹10 avg/signup.
-- Worst case (100% redemption at max discount) ≈ ₹4,887 — under budget.
-- Run this AFTER 0001_init_schema.sql.
-- ============================================================================

insert into colleges (name, short_name, slug, theme, launch_date, campaign_status, early_bird_limit, signup_reward_note, referral_reward_note)
values (
  'KITS Warangal',
  'KITSW',
  'kitsw',
  '{"primary": "#FF5A1F", "text": "#111827", "muted": "#6B7280", "background": "#FAFAFA"}'::jsonb,
  now() + interval '14 days',
  'live',
  500,
  'Launch week rewards, priority access, and a surprise coupon.',
  'Refer friends to unlock bigger rewards.'
);

-- Grab the college id we just made.
do $$
declare
  v_college_id uuid;
begin
  select id into v_college_id from colleges where slug = 'kitsw';

  insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
  values
    (v_college_id, '5% OFF',  'On bills above ₹50',  'percentage_discount', 5,  50,  2.5,  0.58, true),
    (v_college_id, '10% OFF', 'On bills above ₹100', 'percentage_discount', 10, 100, 10,   0.27, true),
    (v_college_id, '15% OFF', 'On bills above ₹150', 'percentage_discount', 15, 150, 22.5, 0.09, true),
    (v_college_id, '20% OFF', 'On bills above ₹200', 'percentage_discount', 20, 200, 40,   0.04, true),
    (v_college_id, '50% OFF', 'On bills above ₹200, up to ₹100 off', 'percentage_discount', 50, 200, 100, 0.02, true);

  -- Sanity check: probabilities must sum to 1.
  if (select sum(probability) from rewards where college_id = v_college_id) != 1 then
    raise exception 'KITSW reward probabilities do not sum to 1';
  end if;
end $$;
