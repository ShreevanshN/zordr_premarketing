# Zordr Pre-Launch Growth Platform — Setup & Deployment

This is the full build across all 5 PRD phases, integrated into one
codebase: dynamic multi-college routing, the signup → mystery-reward →
referral → Campus Insider funnel, and the admin console to configure all
of it without touching code. Phase-by-phase detail (what changed and why)
is in `PHASE1_NOTES.md` through `PHASE5_NOTES.md` if you want the history —
this doc is the single ordered checklist to actually get it running.

---

## 0. What you need before starting
- A Supabase project (you already have one: `evqfbycqbdlmajkjqkji`)
- Node.js 18+ and npm
- The Supabase CLI: `npm install -g supabase`
- A terminal logged into your Supabase account (`supabase login`)

---

## 1. Set up the database

Run every migration **in order** — each one depends on the last. Two ways
to do this:

**Option A — SQL Editor (simplest, no CLI needed):**
Open your Supabase project → SQL Editor → paste and run each file in
`supabase/migrations/`, in this exact order:
1. `0001_init_schema.sql` — all tables, views, RLS
2. `0002_seed_kitsw.sql` — KITSW college + the 5 mystery-card reward tiers
3. `0003_seed_kitsw_insider_fields.sql` — example Campus Insider questions
4. `0004_seed_kitsw_referral_milestones.sql` — referral milestone rewards (placeholder values — see note below)
5. `0005_admin_auth.sql` — the admin allowlist table

**Option B — Supabase CLI:**
```bash
supabase link --project-ref evqfbycqbdlmajkjqkji
supabase db push
```

⚠️ **`0004`'s referral milestone reward values (1/3/5/10 referrals) are
placeholders** — you gave me exact numbers for the mystery-card tiers but
not these. Fine to launch with them, but revisit via the admin console's
Rewards tab once you know what you actually want to offer.

---

## 2. Deploy the Edge Functions

```bash
supabase functions deploy create-student
supabase functions deploy claim-reward
supabase functions deploy submit-campus-insider
supabase functions deploy apply-referral
supabase functions deploy get-referral-stats
supabase functions deploy admin-colleges
supabase functions deploy admin-rewards
supabase functions deploy admin-form-fields
supabase functions deploy admin-applications
supabase functions deploy admin-analytics
```
No manual secrets needed — Supabase injects `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` into every function automatically.

---

## 3. Create your admin account

The admin console (`/admin`) has no self-signup, on purpose:
1. Supabase Dashboard → **Authentication** → **Add User** → create yourself
   an email/password login.
2. Copy that user's UUID, then in the SQL Editor:
   ```sql
   insert into admins (id, email) values ('<uuid>', 'you@zordr.in');
   ```

---

## 4. Run it locally

```bash
npm install
npm run dev
```
`.env.local` is already filled in with your Supabase URL + publishable key.

**Test checklist** (covers all 5 phases in one pass):
1. Visit `/kitsw` — landing page should load real data (name, theme color,
   launch date, live signup count).
2. **Become an Early Bird** → sign up → you should land on the 5-card
   reward picker → pick a card → tap to reveal → real coupon code.
3. On the success page: your referral link, reward code, and (once you've
   referred someone) referral count + milestone progress should all be
   real, pulled from Supabase.
4. Open your referral link in an incognito window, sign up as a second
   student → back in the first tab, refresh `/kitsw/success` → referral
   count should have gone up.
5. **Become a Campus Insider** → your name/email/phone should already be
   filled in and locked → submit → check Supabase, `insider_applications`
   should have a new row.
6. `/admin/login` → sign in → **Overview** tab should show real numbers
   matching everything you just did. Try adding a second college in the
   **Colleges** tab (e.g. slug `vnr`) and visiting `/vnr` — should work
   immediately, no code changes.

---

## 5. Integrating other tools

### WhatsApp Business API
Not connected yet, so reward/referral notifications are currently just
logged, not sent. Once you have a provider (Meta Cloud API direct, or a
wrapper like Gupshup/Interakt/Twilio):
- Swap the body of `sendReward()` in `supabase/functions/claim-reward/index.ts`
- Swap the body of `notifyReferrer()` in `supabase/functions/_shared/referrals.ts`

Nothing else needs to change — both are already isolated for exactly this.

### Google Analytics / other analytics
Not wired in (PRD marked this "future"). When ready, it's a standard Vite
setup: add the tracking script to `index.html`, or use a package like
`react-ga4` and initialize it in `src/main.jsx`.

---

## 6. Deploying to zordr.in

Your other web sub-apps (CorpHub's Finance & Budget app) are already on
Vercel, so that's the path of least friction here too — connect this repo
as a new Vercel project.

**One open decision I can't make for you**: should this live at the
**root** of `zordr.in` (so `zordr.in/kitsw` matches your PRD exactly), or
on a subdomain like `go.zordr.in` or `campus.zordr.in`? That depends on
what's already running at the root of zordr.in today (your main marketing
site?). Whichever you pick, the app itself doesn't need any code changes —
just where you point DNS.

**Steps:**
1. Push this codebase to a GitHub repo (Vercel deploys from Git).
2. In Vercel: **New Project** → import the repo → framework preset should
   auto-detect Vite.
3. **Environment Variables** (Project Settings → Environment Variables) —
   add these for Production (and Preview, if you want PR previews to work):
   ```
   VITE_SUPABASE_URL=https://evqfbycqbdlmajkjqkji.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_hDRSHk73XlOj8Hqgx7ezVg_nXiAhDVK
   ```
   (`.env.local` is gitignored, so these won't come from your repo — Vercel
   needs its own copy.)
4. Deploy. `vercel.json` is already in this repo with the SPA rewrite rule
   Vite/React Router needs — without it, refreshing on `/kitsw/signup`
   directly (not navigating there via a link) would 404, since Vercel would
   otherwise look for a literal `/kitsw/signup` file that doesn't exist.
5. **Custom domain** — Vercel Project Settings → Domains → add `zordr.in`
   (or your chosen subdomain) → Vercel gives you the DNS records to add
   (usually an `A` record to `76.76.21.21` for an apex domain, or a
   `CNAME` for a subdomain) → add those at your domain registrar → Vercel
   auto-provisions SSL once DNS propagates.

**Before going fully live, one hardening step worth doing**: every Edge
Function currently sets `Access-Control-Allow-Origin: *` (open CORS, fine
for development). Once you know your final production domain, tighten
`supabase/functions/_shared/cors.ts` to that specific origin instead of
`*`. Not urgent, but worth doing before wide traffic.

---

## 7. Onboarding additional colleges later
Once everything above is live, adding a new college (VNR, CBIT, etc.) is
**pure configuration** — no code, no redeploy:
1. Admin console → Colleges tab → fill in name/slug/theme/launch date →
   set status to `live`.
2. Rewards tab → add that college's mystery-card tiers (probabilities
   should sum to ~100%) and any milestone rewards.
3. `/<slug>` works immediately.
