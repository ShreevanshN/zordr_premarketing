-- ============================================================================
-- Seed: New Referral Milestones & Rewards
-- ============================================================================

do $$
declare
  v_college_id uuid;
  v_reward_3 uuid;
  v_reward_18 uuid;
  v_reward_38 uuid;
  v_reward_68 uuid;
  v_reward_118 uuid;
  v_reward_188 uuid;
  v_reward_288 uuid;
  v_reward_438 uuid;
begin
  select id into v_college_id from colleges where slug = 'kitsw';

  if v_college_id is not null then
    -- 1. Remove old milestone connections
    delete from referral_milestones where college_id = v_college_id;

    -- 2. Remove old placeholder inactive rewards
    delete from rewards 
    where college_id = v_college_id 
      and active = false 
      and description like 'Referral reward --%';

    -- 3. Insert new rewards with active=false (milestone-only)
    insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
    values (v_college_id, '5% OFF', 'Referral reward -- on bills above ₹50, up to ₹10 off', 'percentage_discount', 5, 50, 10, 0, false)
    returning id into v_reward_3;

    insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
    values (v_college_id, '10% OFF', 'Referral reward -- on bills above ₹100, up to ₹20 off', 'percentage_discount', 10, 100, 20, 0, false)
    returning id into v_reward_18;

    insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
    values (v_college_id, '15% OFF', 'Referral reward -- on bills above ₹120, up to ₹30 off', 'percentage_discount', 15, 120, 30, 0, false)
    returning id into v_reward_38;

    insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
    values (v_college_id, '20% OFF', 'Referral reward -- on bills above ₹150, up to ₹40 off', 'percentage_discount', 20, 150, 40, 0, false)
    returning id into v_reward_68;

    insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
    values (v_college_id, '25% OFF', 'Referral reward -- on bills above ₹180, up to ₹50 off', 'percentage_discount', 25, 180, 50, 0, false)
    returning id into v_reward_118;

    insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
    values (v_college_id, '50% OFF', 'Referral reward -- on bills above ₹250, up to ₹100 off', 'percentage_discount', 50, 250, 100, 0, false)
    returning id into v_reward_188;

    insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
    values (v_college_id, '70% OFF', 'Referral reward -- on bills above ₹300, up to ₹150 off', 'percentage_discount', 70, 300, 150, 0, false)
    returning id into v_reward_288;

    insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
    values (v_college_id, '100% OFF', 'Referral reward -- on bills above ₹300, up to ₹300 off', 'percentage_discount', 100, 300, 300, 0, false)
    returning id into v_reward_438;

    -- 4. Insert new referral milestones corresponding to cumulative thresholds
    insert into referral_milestones (college_id, referral_count, reward_id, active) values
      (v_college_id, 3, v_reward_3, true),
      (v_college_id, 18, v_reward_18, true),
      (v_college_id, 38, v_reward_38, true),
      (v_college_id, 68, v_reward_68, true),
      (v_college_id, 118, v_reward_118, true),
      (v_college_id, 188, v_reward_188, true),
      (v_college_id, 288, v_reward_288, true),
      (v_college_id, 438, v_reward_438, true);
  end if;
end $$;
