-- ============================================================================
-- Deactivate referral milestones higher than 10% OFF (18 referrals)
-- ============================================================================

do $$
declare
  v_college_id uuid;
begin
  select id into v_college_id from colleges where slug = 'kitsw';

  if v_college_id is not null then
    -- Deactivate milestones above 18 referrals (which is 10% OFF)
    update referral_milestones
    set active = false
    where college_id = v_college_id
      and referral_count > 18;
  end if;
end $$;
