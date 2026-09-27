# Personal billing — end-to-end verification

Primary provider: **Polar** (web). Apple App Store notifications are optional (iPad later).

## Polar (local)

1. Copy env from [`.env.example`](../.env.example) → `.env.local`.
2. `npm run polar:catalog -- verify` then `ensure` — set `POLAR_PRODUCT_LAUNCH` (and `POLAR_SERVER`).
3. Forward webhooks to `http://127.0.0.1:43124/api/webhook/polar` (ngrok / cloudflared) **or** test on deployed `app.typefolio.app`.
4. `npm run dev:app`, sign in.
5. Settings → **Upgrade to Launch — £20/yr**, or `POST /api/billing/checkout` with `{ "priceId": "pro_launch" }`.
6. Complete Polar checkout.
7. Confirm webhook **2xx** in Polar dashboard.
8. `GET /api/me` → `entitlement.plan` is `pro`, `features.sync` is `true`.
9. `GET /api/libraries/:id/manifest` with bearer token → **200** (was **403** on Free).
10. Cancel in Polar customer portal (Settings → Manage billing) → webhook → plan returns to `free` unless Apple is still active.

### Plans API (marketing + clients)

- `GET /api/billing/plans` — public, no auth; respects `LAUNCH_OFFER_ACTIVE`.

## Polar (production)

Follow [`docs/LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md) — env on **typefolio-app**, webhook on `https://app.typefolio.app/api/webhook/polar`, then run the smoke test list there.

## Apple (sandbox)

1. Configure App Store Server Notifications URL → `https://app.typefolio.app/api/webhooks/apple`.
2. Set `APPLE_BUNDLE_ID`, `APPLE_APP_ID`, `APPLE_ENVIRONMENT=sandbox`.
3. iOS purchase must set **appAccountToken** to the signed-in Neon Auth `userId` (UUID).
4. Sandbox notification → same `GET /api/me` checks as Polar.

## Dual provider

- User with active Apple + expired Polar remains Pro until Apple expires.
- User with active Polar + no Apple uses launch flag on `isLaunchPricing` when checkout used `pro_launch`.

## Deprecated

- `POST /api/webhooks/revenuecat` returns **410**.
- Stripe is not the active web billing path; see git history / old docs if migrating legacy subs.
