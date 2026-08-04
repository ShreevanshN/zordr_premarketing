-- ============================================================================
-- Add device_type column to students table
-- ============================================================================

alter table students
  add column device_type text;




TRUNCATE TABLE 
  students
CASCADE;