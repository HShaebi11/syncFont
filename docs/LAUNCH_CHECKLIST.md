# Typefolio Launch checklist

Polar production org **typefolio**. Flat subscriptions only — meters are **tracking**, not billing.

**Canonical webhook URL:** `https://app.typefolio.app/api/webhook/polar` (format **Raw**). Legacy `https://app.typefolio.app/api/webhooks/polar` still works.

---

## Done (in repo)

### Billing & ops

- [x] Polar catalog CLI (`npm run polar:catalog -- verify|list|ensure`)
- [x] Launch product wiring (`POLAR_PRODUCT_LAUNCH`, `LAUNCH_OFFER_ACTIVE`)
- [x] Checkout / plans / portal APIs (`POST /api/billing/checkout`, `GET /api/billing/plans`, `POST /api/billing/portal`)
- [x] Webhook handler (`POST /api/webhook/polar`, legacy `/api/webhooks/polar`)
- [x] Usage rollups (`usage_hourly`) + Polar event ingest (`POLAR_USAGE_EVENTS`)
- [x] Polar meters CLI (`npm run polar:meters -- ensure`) — do not attach meters to product prices
- [x] Admin usage + infra estimates (`GET /api/admin/usage`, `ADMIN_USER_IDS`)
- [x] API client: `getBillingPlans`, `startBillingCheckout`, `openBillingPortal` (`@typefolio/core/api`)

### Product & GTM

- [x] Marketing **`/pricing`** (`apps/marketing`) — reads `GET /api/billing/plans` from the product app
- [x] In-app **Upgrade to Launch** — Settings → Account → `pro_launch` checkout
- [x] Launch copy in `getPublicBillingPlans()` — £20/yr all-inclusive, grandfathered while subscribed

---

## Status snapshot (2026-03-27)

| Check | Local `.env.local` | Vercel `typefolio-app` production |
|-------|-------------------|-----------------------------------|
| `POLAR_ACCESS_TOKEN` | ✓ (verify OK) | ✓ synced (`npm run vercel:env:sync`) |
| `POLAR_PRODUCT_LAUNCH` | ✓ (`694b0abe-…`) | ✓ synced |
| `POLAR_WEBHOOK_SECRET` | **Missing** | **Missing** — `npm run polar:webhook -- reset-secret` → `.env.local` → re-sync |
| Polar webhook URL | ✓ `…/api/webhook/polar` | ✓ registered in Polar |
| `LAUNCH_OFFER_ACTIVE` | ✓ | ✓ |
| `ADMIN_USER_IDS` | **Missing** | skipped (set your user id from `GET /api/me`) |
| Meters (4) | ✓ in Polar | N/A |
| **Redeploy** | — | **Required** after env sync for checkout to work in prod |

Run `npm run launch:audit` and `npm run launch:audit -- --prod` anytime.

---

## Must-do before selling Launch (production)

These are **human / Vercel / Polar dashboard** steps — the repo cannot complete them for you.

### 1. Secrets & env (`typefolio-app` on Vercel + root `.env.local`)

- [ ] `POLAR_ACCESS_TOKEN` — production org token (never commit)
- [ ] `POLAR_SERVER=production`
- [ ] `POLAR_PRODUCT_LAUNCH` — UUID from `npm run polar:catalog -- ensure`
- [ ] `LAUNCH_OFFER_ACTIVE=true`
- [ ] `POLAR_WEBHOOK_SECRET` — from Polar after webhook registration
- [ ] Sync to Vercel: `./scripts/sync-typefolio-vercel-env.sh` (or `npm run vercel:env:sync` if wired) → **redeploy typefolio-app**

Token scopes: **products**, **checkouts**, **subscriptions**, **webhooks**, **events** (events required for usage meters).

### 2. Polar webhook

- [ ] `npm run polar:webhook -- list` — confirm endpoint exists
- [ ] `npm run polar:webhook -- ensure` — creates `https://app.typefolio.app/api/webhook/polar` (Raw, subscription events) if missing; prints `POLAR_WEBHOOK_SECRET` once
- [ ] Paste secret into `.env.local` → `npm run vercel:env:sync` → redeploy **typefolio-app**

### 3. Database

- [ ] Production Neon has latest schema, including `usage_hourly` (`db:push` / migration on prod)

### 4. End-to-end smoke test (production or staging with production Polar)

Use a **100% Polar discount** or real card in a test account:

1. [ ] Sign in on `app.typefolio.app`
2. [ ] Settings → **Upgrade to Launch — £20/yr** (or `POST /api/billing/checkout` with `{ "priceId": "pro_launch" }`)
3. [ ] Complete Polar checkout → return URL `/?checkout=success`
4. [ ] Polar webhook delivery **2xx** for subscription create/update
5. [ ] `GET /api/me` → `entitlement.plan` is `pro`, `features.sync` is `true`, `isLaunchPricing` is `true` when applicable
6. [ ] `GET /api/libraries/:id/manifest` with bearer token → **200** (was **403** on Free)
7. [ ] Settings → **Manage billing** opens Polar customer portal

---

## Founder / ops (ongoing)

- [ ] `ADMIN_USER_IDS` — your Neon auth user id from `GET /api/me` (comma-separated)
- [ ] `INFRA_PLATFORM_FIXED_GBP_MONTHLY` — match real Vercel + Neon spend (default 35 in `.env.example`)
- [ ] `npm run polar:catalog -- verify`
- [ ] `npm run polar:meters -- list` — meters exist, **not** linked to product prices in Polar UI
- [ ] After traffic: Polar → **Meters** + `GET /api/admin/usage?days=7` while signed in as admin

---

## Marketing deploy

- [ ] Deploy **typefolio-marketing** so `https://typefolio.app/pricing` is live
- [ ] `NEXT_PUBLIC_API_URL=https://app.typefolio.app` on marketing (so pricing fetches plans from prod)
- [ ] Optional: add Pricing link in footer / emails (nav already includes `/pricing`)

### Plans sanity (Launch phase)

While `LAUNCH_OFFER_ACTIVE=true`, **`GET /api/billing/plans`** must return only **`free`** + **`pro_launch`** (name **Launch**). Checkout must reject `pro_annual` / `pro_monthly` even if env UUIDs exist.

Prod on old `main` may still show four plans until this branch deploys. Verify after deploy:

```bash
curl -sS https://app.typefolio.app/api/billing/plans | python3 -c "import json,sys; d=json.load(sys.stdin); print([p['id'] for p in d['plans']])"
# Expected: ['free', 'pro_launch']
```

---

## After Launch / phase 2

- [ ] Close Launch for new sales: `LAUNCH_OFFER_ACTIVE=false` (existing Launch subs keep renewing on the Launch product)
- [ ] `npm run polar:catalog -- ensure --with-pro` + set `POLAR_PRODUCT_ANNUAL` / `POLAR_PRODUCT_MONTHLY` on Vercel
- [ ] Confirm Pro price (£40/yr anchor) before flipping launch off
- [ ] Optional: raise `PRO_DEVICE_LIMIT` (currently 2) if product decision is 4 devices
- [ ] Update `docs/PRODUCT.md`, `docs/BILLING-E2E.md`, `docs/DEPLOYMENT.md` to Polar-primary (Stripe/RevenueCat historical only)
- [ ] iPad / Apple IAP track (`APPLE_*`, App Store webhooks) when relevant
- [ ] Polar webhook TODOs in `apps/app/src/app/api/webhook/polar/route.ts` (`order.paid`, `customer.state_changed`) if you sell one-time products later

---

## Quick commands

```bash
npm run launch:audit
npm run launch:audit -- --prod
npm run polar:catalog -- verify
npm run polar:catalog -- ensure
npm run polar:meters -- ensure
npm run polar:webhook -- ensure
npm run vercel:env:sync   # after .env.local complete
npm run check:env
npm run dev:app      # app :43124
npm run dev:marketing # marketing :43125 — open /pricing
```

## Local E2E (before prod)

```bash
# Terminal 1
npm run dev:app

# Terminal 2 — expose webhook (ngrok, cloudflared, etc.)
# Register https://<tunnel>/api/webhook/polar in Polar sandbox OR use production with care

# Signed in: Settings → Upgrade, or:
curl -sS -b cookies.txt -X POST http://127.0.0.1:43124/api/billing/checkout \
  -H 'Content-Type: application/json' \
  -d '{"priceId":"pro_launch"}'
```

See also: [`POLAR_SETUP.md`](../POLAR_SETUP.md), [`docs/BILLING-E2E.md`](BILLING-E2E.md), [`docs/DEPLOYMENT.md`](DEPLOYMENT.md).
