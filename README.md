# ChemistryByKK

A modern, claymorphism-style learning hub for **CBSE Class 9–12 Chemistry**, built for the *ChemistryByKK* brand by Khyati Kaushik.

- 🎨 Blue & white claymorphism UI with soft 3D clay shapes
- 📜 Scroll-reactive parallax elements
- 📘 Class 9 / 10 / 11 / 12 chapter library with inline PDF viewer
- ⚡ Cheatsheet asset per chapter (PDF / image) for quick revision
- ☑️ Multi-select chapter download + full class bundle
- 🔐 Disguised admin door behind a generic Sign-In page
- 📊 Real student analytics (KV-backed) with class / streak filters
- 🌗 Light & dark mode + scroll parallax
- 📤 `/share` banner page for YouTube descriptions
- 📈 Vercel Analytics (visitors / countries / referrers)

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** with custom claymorphism shadow tokens
- **Framer Motion** for transitions + parallax
- **Lucide** icons
- **Vercel KV** (Upstash Redis) — students DB
- **Vercel Analytics** — pageview / referrer tracking

---

## Run locally

```bash
npm install
cp .env.example .env.local        # fill in ADMIN_PASSWORD + AUTH_SECRET
npm run dev
```

Open http://localhost:3000

> KV won't actually store anything in dev unless you connect it (see below). The site works fine without KV — sign-ins just won't persist.

---

## ☁️ Deploy to Vercel — full setup walkthrough

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create ChemistryByKK --public --source=. --push
```

(or use the GitHub UI to create a repo and push.)

### Step 2 — Import to Vercel

1. Go to https://vercel.com/new
2. Import your `ChemistryByKK` repo
3. Framework preset: **Next.js** (auto-detected)
4. Click **Deploy** — your site goes live in ~30 seconds.

### Step 3 — Connect Redis (the students database)

Vercel migrated their first-party "KV" to be Marketplace-only. The site uses
the `@upstash/redis` SDK, which auto-detects either naming scheme.

1. In your Vercel project → **Storage** tab → **Create Database**
2. Pick **Redis** (or **Upstash → Redis** if it asks) → free tier (256 MB)
3. Region: close to your users (e.g. `Mumbai – bom1`)
4. Name it e.g. `chemistrybykk-redis`
5. Click **Connect Project** → select this project → all environments → 2 env
   vars are auto-injected:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Step 4 — Add admin secrets

In Vercel project → **Settings** → **Environment Variables**, add:

| Key                    | Value                                                                                  |
|------------------------|----------------------------------------------------------------------------------------|
| `ADMIN_USERNAME`       | `Khyati`                                                                               |
| `ADMIN_PASSWORD`       | a strong password you'll remember (e.g. `Gourav@2002` — feel free to make it stronger) |
| `AUTH_SECRET`          | 32+ random hex chars — generate with the command below                                 |
| `NEXT_PUBLIC_SITE_URL` | `https://your-deployment.vercel.app` (used for OG image link previews)                 |

Generate `AUTH_SECRET` locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set scope to **Production, Preview and Development** for each.

### Step 5 — Redeploy

Push any commit (or hit **Redeploy** on Vercel) so the new env vars are picked up. Once deployed:

- Visit your live URL — anyone can read notes / cheatsheets ✓
- Click **Sign In** in the navbar → looks like a normal newsletter signup
- Enter `Khyati` + your `ADMIN_PASSWORD` → unlocks the admin dashboard
- Enter any other email/password → saves the student to KV (and shows up in your analytics)

### Step 6 — Enable Vercel Analytics

In Vercel project → **Analytics** tab → click **Enable**. Pageviews, top pages, referrers and country breakdown start populating. (No code change required — the `<Analytics />` is already mounted.)

---

## 🧑‍🏫 Admin guide

Visit `/signin`, sign in with `ADMIN_USERNAME` + `ADMIN_PASSWORD`. Two tabs:

### Library tab
- Switch class (9 / 10 / 11 / 12)
- For each chapter, manage **Notes** (PDF) and **Cheatsheet** (PDF or PNG/JPG/WebP) independently
- **Upload / Replace / Hide / Delete** for each
- Uploads here are browser-local (only you see them on this device). For files all visitors should see, drop them at the static paths below.

### Students tab — **the analytics dashboard**
- Stat tiles: total students, joined-7d, joined-30d, active-7d
- By-class breakdown chips
- Filters: search (name/email/school/city), class, daily streak (visited every day for last 7 / 10 days), sort by newest / most active / longest streak
- Per-student card shows class, school, exam target, city, phone, interest, joined date, last seen, daily streak
- **Copy emails** copies all *currently filtered* emails to the clipboard (handy for course outreach)
- **🗑** removes a student (irreversible)

### Static publishing of notes (for production)

The recommended way to put notes on the live site (so all visitors get them):

```
public/notes/class9/<chapter-slug>.pdf
public/notes/class9/<chapter-slug>.cheatsheet.pdf  (or .png / .jpg)
public/notes/class10/...
```

Slugs are auto-derived from chapter names (lowercase, hyphenated). Examples:
- `public/notes/class12/solid-state.pdf`
- `public/notes/class10/acids-bases-and-salts.cheatsheet.pdf`

Once a file exists at the matching path, the site auto-resolves it. Commit + push, Vercel redeploys automatically.

---

## 🔒 Security model

- Admin auth lives **server-side** — `ADMIN_PASSWORD` is in Vercel env vars and never reaches the browser
- Auth state is an HMAC-signed `httpOnly` cookie (not visible to JS, so no XSS theft)
- `/api/auth` is **rate-limited to 8 attempts per minute per IP** via KV — brute-forcing is impractical
- The Sign-In page intentionally looks like a generic newsletter signup so casual visitors don't even see the admin door
- Students see no analytics; only requests with the admin cookie pass `/api/admin/*`

---

## 🛠️ Project structure

```
app/
  page.tsx                          Landing
  share/page.tsx                    Banner share page (for YouTube description)
  signin/page.tsx                   Disguised admin door + subscriber signup
  api/
    auth/route.ts                   POST signup or admin login; GET whoami; DELETE logout
    visit/route.ts                  POST: log a daily visit (subscriber cookie required)
    admin/subscribers/route.ts      GET: list students (admin-only)
    admin/subscribers/[id]/route.ts DELETE: remove a student (admin-only)

components/
  AdminDashboard.tsx                Library + Students tabs
  StudentsAnalytics.tsx             Filters, stats, contact cards
  AssetModal.tsx                    Inline PDF/image viewer
  LearningHub.tsx                   Chapter grid + Notes/Cheatsheet toggle
  SignInToast.tsx                   "Sign in for updates" 5-sec popup
  VisitPing.tsx                     Pings /api/visit once per session
  …

lib/
  kv.ts                             Vercel KV client
  serverAuth.ts                     HMAC cookie signing/verification
  subscribers.ts                    KV CRUD + stats + streak helpers
  rateLimit.ts                      KV-backed fixed-window rate limiter
  notesStore.ts                     Client-side library overrides

data/chapters.ts                    Class & chapter source-of-truth
public/images/                      Hero, banners, portrait, logo
public/notes/                       Static-published PDFs/cheatsheets
```

---

## 🧪 Testing the analytics flow locally

Without KV configured, the API still runs but writes silently fail. To test end-to-end locally:

1. In your Vercel project, go to **Settings → Environment Variables → Pull**
2. Run `vercel env pull .env.local` (after `npm i -g vercel` and `vercel link`)
3. `npm run dev`
4. Sign up at http://localhost:3000/signin with a few test emails
5. Sign in as admin → Students tab → see them appear with daily streaks updating

---

## License

Private project for ChemistryByKK.
#   C h e m i s t r y b y k k  
 