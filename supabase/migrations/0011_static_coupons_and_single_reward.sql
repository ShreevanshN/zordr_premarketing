-- ============================================================================
-- Transition to static coupons (drop unique constraint) and single 10% reward
-- Keep old rewards in database but mark them inactive.
-- ============================================================================

-- 1. Drop the unique constraint on coupons(coupon_code) to allow multiple students to receive the same static code
alter table coupons drop constraint if exists coupons_coupon_code_key;

-- 2. Add the new 10% OFF reward as the only active reward for each college
do $$
declare
  v_college_id uuid;
  v_new_reward_id uuid;
begin
  for v_college_id in select id from colleges loop
    -- Set all existing rewards in this college to inactive
    update rewards set active = false where college_id = v_college_id;

    -- Insert the new single active 10% OFF reward
    insert into rewards (college_id, title, description, reward_type, reward_value, min_order_value, max_discount_amount, probability, active)
    values (v_college_id, '10% OFF', '10% off on orders above ₹80, up to ₹10 off', 'percentage_discount', 10, 80, 10, 1.0, true)
    returning id into v_new_reward_id;

    -- Deactivate old referral milestones for this college
    update referral_milestones set active = false where college_id = v_college_id;

    -- Insert new referral milestones pointing to the new reward (3 and 18 referrals)
    insert into referral_milestones (college_id, referral_count, reward_id, active) values
      (v_college_id, 3, v_new_reward_id, true),
      (v_college_id, 18, v_new_reward_id, true);
  end loop;
end $$;
