# Phase 3 — Campus Insider: Handoff Notes

## What was built
- **`submit-campus-insider` Edge Function** (`supabase/functions/submit-campus-insider/`)
  — validates the student exists (they must already be an Early Bird),
  updates `students.branch/year/hosteller`, validates dynamic-field answers
  against real `dynamic_form_fields` rows (rejects junk keys, enforces
  required ones), and inserts into `insider_applications`. Idempotent —
  resubmitting returns the existing application instead of duplicating.
- **Auto-fill, "don't ask again"** — the form now requires an existing
  Early Bird signup (gated, redirects to `/signup` if missing) and shows
  name/email/phone read-only from that signup, pulled from the session
  `studentService.js` already tracks.
- **Dynamic questions** — rendered live from `dynamic_form_fields`
  (text / textarea / select / radio), on top of the fixed required fields
  (Role, Branch, Year, Hosteller/Day Scholar, Reason). Seeded 3 example
  questions for KITSW in `0003_seed_kitsw_insider_fields.sql` so this is
  actually testable — swap/add real ones by editing that table, no code
  changes needed for a new question.
- **Fixed a pre-existing bug**: the original form's "Department" dropdown
  was pulling from the `DEPARTMENTS` constant meant for the *internal
  Employee Portal* (Finance, Legal & Compliance, Operations, Marketing &
  Sales) — not a student's academic branch. Added a separate
  `ACADEMIC_BRANCHES` list for this form and left `DEPARTMENTS` untouched
  for the Employee Portal.

## Deliberately deferred
- **Admin review UI** for applications (accept/reject) — that's Phase 5.
- **Employee Portal integration** for insiders to log in and see assigned
  tasks — you mentioned this is a separate, later piece of work on the
  employee side.

## Deploy + test
```bash
supabase functions deploy submit-campus-insider
```
Run `0003_seed_kitsw_insider_fields.sql` in the SQL Editor (after 0001/0002)
to get the example dynamic questions.

To test: sign up as an Early Bird first (Campus Insider requires that now),
then go to `/kitsw/campus-insider`. Your name/email/phone should appear
pre-filled and locked. Submit, then check Supabase: `students.branch`,
`.year`, `.hosteller` should be filled in, and there should be a new
`insider_applications` row with `answers` containing your reason plus the
3 dynamic question responses keyed by field ID.
