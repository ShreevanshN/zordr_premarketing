# Phase 1 — Foundation: Handoff Notes

## What was built
- Dynamic `/:collegeSlug` routing (`/kitsw`, `/vnr`, `/cbit`, etc.) replacing the
  hardcoded `/early-access` routes.
- `CollegeProvider` + `useCollege()` — loads the college config object from
  Supabase once per route and hands it to every page. No college name,
  copy, or color is hardcoded in component code anymore; everything reads
  from `college.*`.
- `CollegeGate` — shows a loading state while the college loads, and a clean
  "campaign not found" state for invalid slugs instead of a crash/blank page.
- Full Postgres schema (`supabase/migrations/0001_init_schema.sql`) matching
  every table in the PRD (`colleges`, `students`, `rewards`, `coupons`,
  `referrals`, `referral_milestones`, `insider_applications`,
  `dynamic_form_fields`), plus a `college_public_stats` view so the live
  signup counter never has to trust a client-writable column.
- Row Level Security locked down per the PRD's security rules: only
  `colleges` and `dynamic_form_fields` are directly readable by the browser
  (anon key). Everything touching students, rewards, coupons, or referrals
  has zero anon policies — it will only ever be reachable through Edge
  Functions using the service role key, in Phase 2.
- Seed data (`0002_seed_kitsw.sql`) for KITSW's launch, including the 5
  reward tiers and probabilities we worked out (see below).
- `src/lib/supabase.js` — Supabase client, reading from env vars.

## What's intentionally NOT done yet (later phases)
- Signup / Campus Insider forms still write to `localStorage`, not Supabase.
  Wiring real `createStudent()`, reward-card selection, coupon reservation,
  and WhatsApp sending is Phase 2 (Core User Flow) — doing it now would mean
  rebuilding the signup flow twice once the reward-card screen sits between
  Signup and Success.
- Referral tracking/milestones and the Campus Insider dynamic questions are
  schema-ready but not wired into the UI yet (Phase 3/4).
- Admin configuration UI (Phase 5) doesn't exist — for now, config changes
  happen by editing rows in Supabase directly.
- Employee/Insider Portal (`/employee/login`, `/departments`, `/employees`)
  was left untouched, per your instruction to finish that separately.

## Setup steps
1. **Run the migrations** — open your Supabase project → SQL Editor, and run
   `supabase/migrations/0001_init_schema.sql` first, then
   `supabase/migrations/0002_seed_kitsw.sql`.
2. **Env vars** — `.env.local` is already filled in with the credentials you
   gave me. If you rotate keys or add another environment, copy
   `.env.example` and fill it in. Note: Vite only exposes vars prefixed with
   `VITE_` to the browser bundle — `NEXT_PUBLIC_*` (Next.js convention)
   won't work here.
3. **Install & run**:
   ```bash
   npm install
   npm run dev
   ```
4. Visit `http://localhost:5173/kitsw` — this should load the KITSW landing
   page pulling live data (name, theme color, launch date, signup count)
   straight from Supabase.
5. Try an invalid slug, e.g. `/doesnotexist` — you should get the "campaign
   not found" state instead of a crash.

## Reward tiers seeded for KITSW (₹5,000 budget / 500 signups)
| Tier | Reward | Min order | Probability |
|---|---|---|---|
| 1 | 5% off | ₹50+ | 58% |
| 2 | 10% off | ₹100+ | 27% |
| 3 | 15% off | ₹150+ | 9% |
| 4 | 20% off | ₹200+ | 4% |
| 5 | 50% off (capped ₹100) | ₹200+ | 2% |

Worst-case liability (100% redemption, everyone hits max discount) ≈ ₹4,887 —
under budget. These live entirely in the `rewards` table, so you can tune
percentages/probabilities per college without touching code.

## Onboarding a second college (e.g. VNR)
Once Phase 5 (Admin) exists this will be a UI. For now, it's just SQL:
```sql
insert into colleges (name, short_name, slug, theme, launch_date, campaign_status, early_bird_limit)
values ('VNR VJIET', 'VNR', 'vnr', '{"primary": "#..."}'::jsonb, now() + interval '14 days', 'live', 500);
-- then insert 5 rows into `rewards` for that college_id, matching whatever
-- budget/probability math you want for that campus.
```
No frontend code changes needed — `/vnr` will just work.
