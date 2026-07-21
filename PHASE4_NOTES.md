# Phase 4 — Referral Engine: Handoff Notes

## What was built
- **`applyReferral()` logic** (`supabase/functions/_shared/referrals.ts`) —
  the actual PRD flow: Validate → Store Referral → Increase Count → Check
  Milestone → Assign Reward → Notify Referrer. Called automatically from
  inside `create-student` whenever a signup comes in with a valid `?ref=`
  code — no extra round trip needed for the common path.
- **`apply-referral` Edge Function** — a standalone endpoint wrapping the
  same shared logic, for reprocessing (e.g. an admin corrects a mistyped
  ref code after the fact). Safe to call repeatedly — idempotent via the
  `referrals.referred` unique constraint.
- **`get-referral-stats` Edge Function** — powers the referral dashboard:
  referral count, full milestone ladder with achieved/locked state + earned
  coupon codes, and a top-5 leaderboard (first names only) for the college.
- **Success page now shows real data** — the "coming soon" placeholder from
  Phase 2 is gone; referral count, milestone progress, and leaderboard are
  all live from Supabase.
- **Milestone rewards seeded** for KITSW at 1 / 3 / 5 / 10 referrals
  (`0004_seed_kitsw_referral_milestones.sql`) — **placeholder values**,
  see the flag below.
- **Milestone rewards vs. mystery-card pool stay separate**: milestone
  reward rows are inserted with `active = false` so `claim-reward`'s random
  selection (which only pulls `active = true`) never picks them up by
  accident. `applyReferral()` looks them up directly by ID, ignoring that
  flag — it means "in the random rotation," not "enabled."

## ⚠️ Needs your input: referral reward values are placeholders
You gave me exact numbers for the 5 mystery-card tiers, but not for referral
milestones. I seeded these guesses so the feature is testable — please
replace them with real values whenever you're ready (just a SQL update, no
code changes):

| Referrals | Placeholder reward |
|---|---|
| 1 | 10% off, ₹100+ orders, capped ₹15 |
| 3 | 20% off, ₹150+ orders, capped ₹40 |
| 5 | 30% off, ₹200+ orders, capped ₹75 |
| 10 | 50% off, ₹250+ orders, capped ₹200 |

## Deploy + test
```bash
supabase functions deploy create-student   # redeploy -- now calls applyReferral()
supabase functions deploy apply-referral
supabase functions deploy get-referral-stats
```
Run `0004_seed_kitsw_referral_milestones.sql` in the SQL Editor (after
0001–0003).

**To test the full loop:**
1. Sign up as Student A on `/kitsw/signup` — note the referral link shown
   on the success page (`zordr.in/kitsw?ref=STUDENTA-CODE`).
2. Open that link in a new incognito window/tab and sign up as Student B.
3. Back in Student A's tab, refresh `/kitsw/success` — "Friends joined"
   should now show `1`, and if you sign up 3 total referred friends, the
   "3 referrals" milestone should flip to achieved with a real coupon code
   next to it.
4. Check Supabase: a new `referrals` row (status `confirmed`), and once a
   milestone is crossed, a new `coupons` row with `claimed_by` = Student A.

## Deliberately deferred
- **Referral dashboard as its own page** — currently folded into the
  success page rather than a separate `/dashboard` route. Can split out
  later if you want a persistent place to check progress after the initial
  session.
- **Admin visibility into referral fraud/abuse** (e.g. rate-limiting
  repeated signups from the same device) — Phase 5 (Admin) territory.

## Minor note (not a Phase 4 issue, just flagging)
The production build now shows a "chunk larger than 500kB" warning — normal
as the app grows, not an error, doesn't block anything. Worth revisiting
with code-splitting once there's more to split (e.g. once the Employee
Portal grows), not urgent for a funnel this size.
