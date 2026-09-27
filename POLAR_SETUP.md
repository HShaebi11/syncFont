# Polar setup (Typefolio)

Full launch todo list: [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md).

Integration target: **`apps/app`** (`@typefolio/app`) — Next.js 16 App Router, TypeScript, dev port **43124**.

This project uses **Polar production** (`POLAR_SERVER=production`, org **typefolio**). Charges and webhooks are live, not sandbox.

## Files created or changed

| File | Change |
|------|--------|
| `apps/app/src/app/checkout/route.ts` | **New** — `GET /checkout?products=<uuid>` → Polar hosted checkout (no `successUrl`). |
| `apps/app/src/app/api/webhook/polar/route.ts` | **New** — `POST /api/webhook/polar` with `@polar-sh/sdk/webhooks` `validateEvent`. |
| `apps/app/src/app/api/webhooks/polar/route.ts` | **Updated** — re-exports new handler (legacy URL). |
| `packages/core/src/lib/billing/polar.ts` | **Updated** — `POLAR_SERVER` defaults to `production` (only `sandbox` selects sandbox). |
| `apps/app/package.json` | **Updated** — `@polar-sh/sdk` (removed deprecated `@polar-sh/nextjs`). |
| `.env` | **New** — placeholder keys; **secrets belong in `.env.local`** (used by `npm run dev`). |

Existing app billing (unchanged paths):

- `POST /api/billing/checkout` — authenticated checkout via `priceId` and entitlements.
- `POST /api/billing/portal` — customer portal session.
- `packages/core/src/lib/billing/polar-webhook.ts` — subscription sync (still invoked from the webhook handler for subscription events).

## Environment variables (names only)

Set in **`.env.local`** at the repo root (see `.env.example`):

- `POLAR_ACCESS_TOKEN` — organization access token ([settings](https://polar.sh/dashboard/typefolio/settings)), production, scopes: products, checkouts, subscriptions, webhooks (read + write). **Local only** — put in `.env.local`, never commit.
- `POLAR_WEBHOOK_SECRET` — from Polar when a webhook endpoint is created (or dashboard).
- `POLAR_SERVER` — `production` for this org.
- `POLAR_PRODUCT_ANNUAL`, `POLAR_PRODUCT_MONTHLY`, `POLAR_PRODUCT_LAUNCH` — catalog product UUIDs for in-app `/api/billing/checkout` (optional for generic `/checkout` test links).

## Local token for agents / CLI

1. Create an organization access token in Polar (must match `POLAR_SERVER`: `production` vs `sandbox`).
2. Add `POLAR_ACCESS_TOKEN` to **`.env.local`** at the repo root.
3. Run:

```bash
npm run polar:catalog -- verify    # token + API
npm run polar:catalog -- list      # products + env UUID mapping
npm run polar:catalog -- ensure    # idempotent: Typefolio Launch £14.99/yr
npm run polar:catalog -- sync      # add new Launch price + trial; archive legacy product names
npm run polar:catalog -- ensure --with-pro   # also Typefolio Pro £40/yr + monthly £4.99
```

Paste the printed `POLAR_PRODUCT_*` lines into `.env.local`. The CLI never prints the access token.

**Launch phase:** no subscriber cap — open/close Launch for new sales with `LAUNCH_OFFER_ACTIVE` (`true` / `false` / `0`). Existing Launch subscriptions keep renewing on the Launch Polar product.

## Usage meters (tracking only — not billing)

Meters answer “how much are people using Typefolio?” They do **not** change what customers pay. Checkout and renewals stay **flat** (Launch £14.99/yr, Pro when enabled). The app never attaches meters to products or creates usage-based prices.

1. Token scopes: include **events** read/write for ingest + meters.
2. Create meters in Polar: `npm run polar:meters -- ensure` (aggregation only — do not link meters to product prices in the Polar UI).
3. App records usage on sync manifest fetch, font upload, device sync/register (`POLAR_USAGE_EVENTS=true` by default).
4. Founder summary API: set `ADMIN_USER_IDS` to your auth user id(s), then `GET /api/admin/usage?days=7` while signed in.
5. Polar dashboard → **Meters** for per-customer charts; admin API for cross-user totals in Neon `usage_hourly` rollups.
6. `GET /api/admin/usage` includes **estimated infra cost (GBP)** for your margin math. Subscriptions are **all-inclusive** — infra is not billed separately to customers. Tune `INFRA_PLATFORM_FIXED_GBP_MONTHLY` (default 35).

Alternate verify (curl, no secret in output):

```bash
npx dotenv -e .env.local -- bash -c 'curl -sS -o /dev/null -w "%{http_code}\n" -L -H "Authorization: Bearer ${POLAR_ACCESS_TOKEN}" "https://api.polar.sh/v1/products/?limit=1"'
```

Expect `200`. `401`/`403` → token from the correct server with correct scopes.

## Polar resources

| Resource | ID / status |
|----------|-------------|
| Organization | `typefolio` (`94a37d14-3e88-49b5-9125-9890af875442`) |
| Test product **Test Product** ($10 one-time) | **Not provisioned** — API returned `401` until `POLAR_ACCESS_TOKEN` is set in `.env.local`. Re-run provisioning below after the token works. |
| Webhook endpoint | Register with **`npm run polar:webhook -- ensure`** → `https://app.typefolio.app/api/webhook/polar` (Raw, subscription events). Legacy `/api/webhooks/polar` still works. |

### Provision catalog + webhook (after token works)

```bash
npm run polar:catalog -- ensure
npm run polar:webhook -- ensure    # prints POLAR_WEBHOOK_SECRET once
npm run vercel:env:sync            # push secrets to typefolio-app
```

Full launch steps: [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md).

## Customer portal

Polar hosts the customer portal and emails customers a link. No dedicated portal route is required for that flow. This app still exposes **`POST /api/billing/portal`** for signed-in “Manage billing” if you use it in the UI.

## Verify before merge

- [ ] `POLAR_ACCESS_TOKEN` and `POLAR_WEBHOOK_SECRET` set in `.env.local` (never committed).
- [ ] `npm run polar:catalog -- verify` succeeds (or token verify curl returns `200`).
- [ ] `npm run polar:catalog -- ensure` and `POLAR_PRODUCT_LAUNCH` set in `.env.local`.
- [ ] `npm run typecheck` passes.
- [ ] `npm run dev:app` — open `http://localhost:43124/checkout?products=<PRODUCT_ID>`.
- [ ] Webhook endpoint in Polar dashboard points to `/api/webhook/polar` on the **deployed** app URL; `POLAR_WEBHOOK_SECRET` matches.
- [ ] For a no-charge test: create a **100% discount** in Polar, apply the code on the hosted checkout page (checkout links cannot pre-apply discount codes).

## Dev server

```bash
npm run dev:app
```

First generic checkout link (after product id is known):

`http://localhost:43124/checkout?products=<PRODUCT_ID>`
