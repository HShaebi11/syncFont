# Typefolio — deployment & environment

How we split **one Git repo** into **two Vercel projects**: marketing and product (UI + API). Env vars are managed **per project** (or via **Shared Environment Variables** on the team), not per deployment.

Official references: [Monorepos on Vercel](https://vercel.com/docs/monorepos/turborepo), [Environment variables](https://vercel.com/docs/environment-variables), [Shared env vars](https://vercel.com/docs/rest-api/environment/create-one-or-more-shared-environment-variables).

## Target layout (Turborepo)

```
typefolio/
├── packages/core/          # @typefolio/core — db, entitlements, billing, storage
├── apps/
│   ├── marketing/          # @typefolio/marketing — landing, pricing, legal
│   ├── app/                # @typefolio/app — product UI, /api/*, webhooks, /auth/desktop
│   └── admin/              # (later) founder console
├── apps/typefolio-native/  # Swift macOS + iPad
├── apps/typefolio-desktop/ # Electron (optional)
└── turbo.json
```

Each folder is **one Vercel project** with **Root Directory** set to that path (e.g. `apps/marketing`).

| Vercel project | Domain (prod) | Builds when | Role |
|----------------|---------------|-------------|------|
| `typefolio-marketing` | `typefolio.app` | `turbo run build --filter=marketing` | Story, pricing, SEO; no DB |
| `typefolio-app` | `app.typefolio.app` | `filter=app` | Product UI, `/api/*`, webhooks, Better Auth, `/auth/desktop` |
| `typefolio-admin` | `admin.typefolio.app` | `filter=admin` | Ops (later) |

Native browser sign-in and all JSON API routes live on **`app.typefolio.app`** (same origin as the signed-in web UI). Desktop and native clients use that host as their API base URL.

**Ignored Build Step** (each project): `npx turbo-ignore --fallback=HEAD^1`  
**Build command** (each project): `cd ../.. && turbo run build --filter=<package-name>`

Optional: `gettypefolio.com` → 308 redirect to `https://typefolio.app`.  
Optional: retire `api.typefolio.app` with a 308 to `https://app.typefolio.app` if the old project existed.

## Why marketing is separate

- **Different change cadence** — copy and landing experiments without redeploying auth, library, or webhooks.
- **Minimal secrets** — marketing should not receive `DATABASE_URL`, Polar signing secrets, or Apple keys.
- **Smaller attack surface** — static/ISR pages only; CTAs link to `app.typefolio.app` for auth.
- **Clear analytics** — marketing conversion vs product usage.

| Surface | Host |
|---------|------|
| Marketing `/`, pricing, `/downloads` | `typefolio.app` |
| `/auth/desktop`, `/auth/sign-up`, `/api/*` | `app.typefolio.app` |

Marketing CTAs: `https://app.typefolio.app/auth/sign-up`.

## Routing between projects

**Do not** use [Microfrontends](https://vercel.com/docs/microfrontends) for this — we use **different hostnames**, not path routing on one apex.

- Browser product UI calls **`/api/*` on the same host** as the app.
- Desktop / native clients call **`https://app.typefolio.app`**.

**Webhooks** (Polar, Apple) must target **`https://app.typefolio.app/api/webhooks/...`** only.

## Auth trusted origins

Configure Better Auth / OAuth for:

- `https://typefolio.app` (marketing)
- `https://app.typefolio.app` (product + API)
- Preview URLs for marketing and app projects

## Environment variables

### Secrets on product app only

| Variable | Marketing | App | Admin (later) |
|----------|:---------:|:---:|:-------------:|
| `DATABASE_URL` | — | ✓ | ✓ (read) |
| `BETTER_AUTH_SECRET` | — | ✓ | — |
| Blob read/write keys | — | ✓ | — |
| Polar / Apple webhook keys | — | ✓ | — |

### Per-project URLs (production)

| Variable | Marketing | App |
|----------|-----------|-----|
| `NEXT_PUBLIC_MARKETING_URL` | `https://typefolio.app` | `https://typefolio.app` |
| `NEXT_PUBLIC_APP_URL` | `https://app.typefolio.app` | `https://app.typefolio.app` |
| `NEXT_PUBLIC_API_URL` | `https://app.typefolio.app` (CTA links) | `https://app.typefolio.app` |
| `BETTER_AUTH_URL` | — | `https://app.typefolio.app` |

### Desktop downloads (Vercel Blob)

Installers live in a **public** Blob store **`typefolio-desktop`**, connected to **`typefolio-marketing`** (separate from the app’s private font store).

| Step | Command / config |
|------|------------------|
| 1. Build | **macOS:** `npm run dist:desktop:mac`. **Windows / Linux:** run on those OSes, or use GitHub Actions **Desktop release** (`.github/workflows/desktop-release.yml`) |
| 2. Token | `cd apps/marketing && vercel env pull .env.upload --environment=production` |
| 3. Upload | `npm run upload:desktop:blob:marketing` |
| 4. Marketing env | **`DESKTOP_BLOB_PUBLIC_ORIGIN`** = public Blob store origin |
| 5. Redeploy | Redeploy **typefolio-marketing** after first Blob setup |

Public page: **`https://typefolio.app/downloads`**.

### Local dev

```bash
cd apps/marketing && vercel link --project typefolio-marketing && vercel env pull .env.local
cd apps/app       && vercel link --project typefolio-app       && vercel env pull .env.local
```

Repo root **`.env.example`** is the checklist; per-project copies: **`apps/app/.env.example`**, **`apps/marketing/.env.example`**.

```bash
npm run dev:app        # product + API on :43124
npm run dev:marketing  # :43125
npm run vercel:env:sync
```

### Post-deploy checklist (Polar / OAuth)

1. `npm run vercel:env:sync` then redeploy **typefolio-app**.
2. Polar webhook → `https://app.typefolio.app/api/webhooks/polar`.
3. Google OAuth redirect URLs → `https://app.typefolio.app`.

## CI

On PRs: `turbo run typecheck test build --affected`

## Related docs

- [`docs/BILLING-E2E.md`](BILLING-E2E.md) — webhooks on **app** project
- [`docs/PRODUCT.md`](PRODUCT.md) — domains and pricing
- [`docs/MAP.md`](MAP.md) — code areas
