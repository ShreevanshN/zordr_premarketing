# Phase 2 — Core User Flow: Handoff Notes

## What was built
- **`create-student` Edge Function** (`supabase/functions/create-student/`) —
  validates the college is live, generates the referral code server-side,
  handles duplicate resubmission gracefully (returns the existing code
  instead of erroring), and records `referred_by` if a valid `?ref=` code
  was passed in.
- **`claim-reward` Edge Function** (`supabase/functions/claim-reward/`) —
  weighted-random reward pick using each college's `rewards.probability`,
  generates a fresh coupon code, and enforces "claim only once" with an
  atomic guard (`WHERE reward_id IS NULL`) that survives a double-click /
  race condition by rolling back the extra coupon it reserved.
- **`sendReward()`** inside `claim-reward` is a stub — logs instead of
  calling WhatsApp, since no provider is connected yet. Swapping in a real
  API call later doesn't require touching anything else in the function.
- **Reward card flow** (`src/pages/early-access/RewardCards.jsx`, route
  `/:collegeSlug/reward`) — 5-card pick → tap-to-reveal → coupon display →
  celebrate/share screen, matching your screenshots.
- **Real signup** — `EarlyAccessSignup.jsx` now calls `create-student`
  instead of writing to `localStorage`.
- **Real success page** — reads the actual referral code + coupon from this
  browser's session instead of fabricated data. If someone lands on
  `/success` without a session (new tab, etc.), it sends them back to sign
  up instead of showing broken state.
- `src/services/studentService.js` — the only place the frontend talks to
  these two Edge Functions; also manages the `sessionStorage` used to carry
  `studentId` / `referralCode` / `couponCode` between pages, since the
  `students` table has zero direct anon read access by design (see Phase 1
  RLS notes) — there's currently no safe way to re-fetch "your own" record
  by ID without auth, so a page reload loses this. That's fine for a single
  sitting funnel; Phase 4/auth work can add a proper lookup later if needed.

## Deliberately deferred (per your "phase by phase" instruction)
- **Referral crediting & milestones** — `referred_by` is captured now, but
  nobody's referral count increments yet, and the leaderboard/count on the
  success page is an honest "coming soon" placeholder rather than fake
  numbers. That's Phase 4 (Referral Engine).
- **Real WhatsApp send** — stubbed, logs only. Swap `sendReward()` once a
  provider is connected.
- **Campus Insider form** — still on `localStorage`, unchanged from Phase 1.
  That's Phase 3.

## Deploying the Edge Functions
I can't deploy these from this sandbox — outbound network here is limited
to npm/GitHub package registries, not the Supabase API — so this part needs
you, with the Supabase CLI logged into your account:
```bash
npm install -g supabase
supabase login
supabase link --project-ref evqfbycqbdlmajkjqkji
supabase functions deploy create-student
supabase functions deploy claim-reward
```
No manual secrets needed — Supabase automatically injects `SUPABASE_URL`
and `SUPABASE_SERVICE_ROLE_KEY` into every deployed Edge Function's runtime.

## Testing the flow locally
1. Make sure Phase 1's migrations are already run (`0001_init_schema.sql`,
   `0002_seed_kitsw.sql`).
2. Deploy both functions (above).
3. `npm install && npm run dev`, visit `/kitsw` → Become an Early Bird →
   fill the form → you should land on the 5-card picker.
4. Pick a card → tap to reveal → you should see a real coupon code that
   only exists because the `claim-reward` function just created it in the
   `coupons` table.
5. Check the Supabase Table Editor: the `students` row should now have
   `reward_id` and `coupon_id` filled in, and there should be a matching
   `coupons` row with `claimed = true`.
6. Refresh the reward page or resubmit the signup form — you should get
   your *same* reward back, not a new one (idempotency check).

## Known lint note
`react-hooks/set-state-in-effect` (a newer, fairly strict rule) flags the
data-fetch-on-mount pattern used in `CollegeContext.jsx` — the same pattern
already existed in the original handoff code (`Employees.jsx`, the old
`EarlyAccessSuccess.jsx`). It doesn't affect the production build, which
passes clean. Worth a dedicated cleanup pass later if you want it silenced,
but not blocking.
