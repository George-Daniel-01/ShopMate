# ShopMate — Operations Manual

The complete guide to keeping ShopMate alive. If you return to this project after
months away, start here. Everything you need is in this file.

---

## 1. What is deployed where

| App | URL | Vercel project | Source folder |
|---|---|---|---|
| Storefront | https://shop-mate-six-azure.vercel.app | `shop-mate` | `frontend/` |
| Admin dashboard | https://shop-dashboard-tan.vercel.app | `shop-dashboard` | `ecommerce-dashboard-template/` |
| Backend API | https://shop-mate-backend.vercel.app | `shop-mate-backend` | `FULL-STACK-ECOMMERCE-AI-BASED-WEB-APPLICATION-BACKEND-CODE/` |
| API Docs | https://shop-mate-backend.vercel.app/api/v1/docs | `shop-mate-backend` | served by the backend (Swagger UI) |
| Database | Neon PostgreSQL 17 (project `ep-green-glitter-abnrioso`, database `shopmate`) | — | — |
| Source code | https://github.com/George-Daniel-01/ShopMate | — | — |
| DB backups | https://github.com/George-Daniel-01/ShopMate-backups (private) | — | — |

All three Vercel projects auto-deploy from the `main` branch of the GitHub repo.
**Push to GitHub = deploy.** No manual Vercel steps needed.

---

## 2. Quick status check (30 seconds)

```bash
# 1. Is the API healthy? It also self-heals the DB schema.
curl https://shop-mate-backend.vercel.app/api/v1/health
# {"success":true,"service":"shopmate-api","db":"up","schema":"ready",...}  <- good

# 2. Does the storefront load?
curl -s -o /dev/null -w "%{http_code}" https://shop-mate-six-azure.vercel.app/
# 200

# 3. Any open outage issues?
gh issue list --repo George-Daniel-01/ShopMate
```

The `keepalive.yml` GitHub Action pings all three sites every 15 minutes and
opens a GitHub issue if anything is down. **If you get a "⚠️ Outage detected"
email, go to section 3.**

---

## 3. Incident playbook — the site is broken

Most outages are the database. The API has a built-in self-healing
`/api/v1/health` endpoint that re-creates missing tables on demand.

1. **Hit health, wait 10s, hit it again:**
   ```bash
   curl https://shop-mate-backend.vercel.app/api/v1/health
   ```
   First call may return 503 while the Neon compute wakes / tables are rebuilt.
   Once it returns `"db":"up","schema":"ready"`, the site works again.

2. **If health stays red:** check the deployment state —
   https://vercel.com/dashboard → project → Deployments. Recent deployments are
   usually fine; this only breaks if no commit has been pushed in a while and
   Vercel/Neon changed something.

3. **If the DB is truly gone (project deleted / connection refused):**
   - Restore from the latest dump in the private repo
     `George-Daniel-01/ShopMate-backups` (see section 6).
   - Or point `DATABASE_URL` at any empty Postgres and let the API
     auto-create all tables (`/api/v1/health` does it).

4. **If you lost admin access:** see section 7 (make-admin recovery).

---

## 4. Accounts & where the secrets live

| Service | Account | Secrets location |
|---|---|---|
| GitHub | George-Daniel-01 (email: georgeabiamakadaniel@gmail.com) | `gh` CLI logged in on laptop |
| Vercel | george-daniel-01 (same email) | Project env settings, Vercel dashboard |
| Neon (DB) | same email, console.neon.tech | `DATABASE_URL` in Vercel backend env |
| Cloudinary (images) | same email | `CLOUDINARY_*` in Vercel backend env |
| Stripe (payments) | same email | `STRIPE_*` in Vercel backend env |
| SMTP (emails) | same email | `SMTP_*` in Vercel backend env |
| NVIDIA NIM (AI search, primary) | `mykey.py` in D:\code\GenericAgent | `NVIDIA_API_KEY` in Vercel backend env |
| OpenRouter (AI search, fallback) | same email | `OPENROUTER_API_KEY` in Vercel backend env |

**Rule: env vars live ONLY in the Vercel dashboard** (project → Settings → Environment Variables).
They are NOT in the repo. The one exception is the backup URL stored as a GitHub
Actions secret (used by the weekly dump).

To pull the env vars locally:
```bash
cd FULL-STACK-ECOMMERCE-AI-BASED-WEB-APPLICATION-BACKEND-CODE
vercel link --project shop-mate-backend --yes
vercel env pull --environment=production
```

---

## 5. Database

- Provider: Neon (free tier), PostgreSQL 17
- Project: `ep-green-glitter-abnrioso` (eu-west-2), database: **`shopmate`**
- IMPORTANT: the same Neon project also contains the `neondb` database used by
  the cal.diy project. Never point the ShopMate backend at `neondb` again —
  it has a completely different schema.
- Free tier behavior: the compute pauses after ~5 min without traffic; the first
  request after idle takes a few extra seconds. The keep-alive action keeps it
  warm. Neon also suspends projects after long inactivity — the console can
  wake/restore it.
- The API creates its own tables (`CREATE TABLE IF NOT EXISTS`) on startup and
  via `/api/v1/health`. No manual schema management needed.
- Offline schema/data snapshots exist in the repo:
  `FULL-STACK-ECOMMERCE-AI-BASED-WEB-APPLICATION-BACKEND-CODE/schema_export.sql`
  and `data_export.sql`.

---

## 6. Backups & restore

- The `backup.yml` GitHub Action runs **every Monday 03:30 UTC** (and can be
  triggered manually: Actions → Database Backup → Run workflow).
- Each run pushes `dump.sql` (full pg_dump) to the **private** repo
  `George-Daniel-01/ShopMate-backups`.
- To restore:
  ```bash
  # 1. Get the latest dump
  gh repo clone George-Daniel-01/ShopMate-backups
  # 2. Reset the target database
  #    (drop/recreate or use a fresh database)
  # 3. Apply the dump
  docker run --rm -v "$PWD:/out" postgres:17 \
    psql "$DATABASE_URL" -f /out/dump.sql
  ```
- The backup workflow uses two GitHub Actions secrets in the ShopMate repo:
  `DATABASE_URL` (the shopmate connection string) and `BACKUP_DEPLOY_KEY`
  (SSH deploy key with write access to the backups repo).

---

## 7. Admin recovery (if you lose the admin account)

The temporary `/api/v1/auth/make-admin` endpoint can promote ANY user to ADMIN
by email — no password needed:

```bash
curl -X POST https://shop-mate-backend.vercel.app/api/v1/auth/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

Flow:
1. Register a fresh account via the storefront (or POST `/api/v1/auth/register`).
2. Call make-admin with that email.
3. Log in on the dashboard.

> ⚠️ This endpoint is unauthenticated and should be **removed** once you're
> confident the admin account works (edit `controllers/authController.ts`,
> delete `router.post("/make-admin", ...)` in `router/authRoutes.ts`, deploy).

---

## 8. Development on this laptop

Frontend:
```bash
cd frontend && npm i && npm run dev          # http://localhost:5173
```

Dashboard:
```bash
cd ecommerce-dashboard-template && npm i && npm run dev   # http://localhost:5174
```

Backend (needs a local `config/config.env` — copy `.env.example` from the
backend folder, fill from `vercel env pull`):
```bash
cd FULL-STACK-ECOMMERCE-AI-BASED-WEB-APPLICATION-BACKEND-CODE
npm i
npm run dev                                  # http://localhost:4000
```

Typecheck everything: `npm run build` in each folder (CI does the same).

---

## 9. The long-term safety net (already in place)

| Safety net | What it does |
|---|---|
| `/api/v1/health` | Self-heals the DB schema on demand |
| `keepalive.yml` | Pings all 3 apps every 15 min; opens a GitHub issue if down |
| `backup.yml` | Weekly pg_dump → private backup repo |
| GitHub auto-deploy | Push to `main` deploys storefront + dashboard + backend |
| CI | Typecheck + lint + test + build on every push |
| This manual | Everything needed to recover after a year away |

---

## 10. Known gaps / to-do

- `NVIDIA_API_KEY` in Vercel is a 2-char placeholder — the AI product
  search feature is currently off. Add the real NVIDIA NIM key (same key as
  GenericAgent's `mykey.py`) to turn it on; OpenRouter fallback works too.
- The Neon free tier caps storage; the `shopmate` DB should stay tiny. Check
  occasionally at console.neon.tech.
- The old production database (the one with the cal.diy schema) still contains
  the cal.diy data — keep it for reference, but ShopMate must always use the
  `shopmate` database.
- Local `config/config.env` does not exist — create it from `.env.example`
  before running the backend locally.

## Deploying from the CLI

Both Vercel projects have a **Root Directory** set (`frontend` and `ecommerce-dashboard-template`), so `vercel --prod` from *inside* the subfolder fails with a double-path error. To deploy from the CLI:

1. Ensure the app's `.vercel` link points at the right project (`frontend/.vercel` → `shop-mate`, `ecommerce-dashboard-template/.vercel` → `shop-dashboard`).
2. Copy the app folder's `.vercel` to the repo root, then run `vercel --prod --yes` from `D:/code/ShopMate`.
3. After deploying, delete the root `.vercel` and `.env.local` again so each app keeps its own link (the CLI regenerates `.env.local` on every deploy; it is gitignored so leaving it is harmless).
4. If a deploy fails, the copied root `.vercel` is left in place - just re-run `vercel --prod --yes` to retry, then clean up.

For example:

```bash
# Storefront
rm -rf .vercel && cp -r frontend/.vercel . && vercel --prod --yes && rm -rf .vercel

# Dashboard
rm -rf .vercel && cp -r ecommerce-dashboard-template/.vercel . && vercel --prod --yes && rm -rf .vercel
```
