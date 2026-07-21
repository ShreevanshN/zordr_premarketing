-- ============================================================================
-- Seed: example dynamic_form_fields for KITSW's Campus Insider application.
-- These are on top of the fixed required fields (Branch, Year,
-- Hosteller/Day Scholar, Why do you want to join, Preferred Role) which are
-- built into the form itself, not stored here. This table is only for the
-- *extra*, per-college questions an admin can add without touching code.
-- ============================================================================

do $$
declare
  v_college_id uuid;
begin
  select id into v_college_id from colleges where slug = 'kitsw';

  insert into dynamic_form_fields (college_id, label, type, options, required, display_order)
  values
    (v_college_id, 'Which clubs or communities are you part of on campus?', 'text', null, false, 1),
    (v_college_id, 'How many hours a week can you commit?', 'select', '["1-2 hrs", "3-5 hrs", "5+ hrs"]'::jsonb, true, 2),
    (v_college_id, 'Have you promoted a product or event on campus before?', 'radio', '["Yes", "No"]'::jsonb, false, 3);
end $$;
