# Typefolio

Your fonts, on every device.

Upload font files once. Sign in with the same account on Mac or iPad to sync and install them.

Product strategy: [`docs/PRODUCT.md`](docs/PRODUCT.md) · Repo map: [`docs/MAP.md`](docs/MAP.md)

## Monorepo

| Workspace | Local URL | Purpose |
|-----------|-----------|---------|
| `@typefolio/app` | http://127.0.0.1:43124 | Product web UI, `/api/*`, webhooks, Better Auth, `/auth/desktop` |
| `@typefolio/marketing` | http://127.0.0.1:43125 | Marketing landing shell |
| `typefolio-desktop` | — | Electron desktop (macOS / Windows / Linux) |
| `@typefolio/core` | — | Shared DB, billing, storage |

Auth for desktop and native clients lives on the product app at `/auth/desktop` and `/auth/sign-up`. Billing and account upgrades open in the system browser.

```bash
npm install
cp .env.example .env.local   # fill in Neon, Blob, Better Auth, Polar, Resend
# Vercel: see apps/app|marketing/.env.example — sync secrets with npm run vercel:env:sync
npm run check:env
npm run dev                  # app + marketing (Turborepo)
# or: npm run dev:app | dev:marketing
npm run smoke                # hits app on :43124
npm test
```

## Native (macOS + iPad)

[`apps/typefolio-native/README.md`](apps/typefolio-native/README.md)

```bash
cd apps/typefolio-native
swift run Typefolio
```

App + Mac together:

```bash
npm run dev:native
```

## Desktop (Electron)

[`apps/typefolio-desktop/README.md`](apps/typefolio-desktop/README.md)

```bash
npm run dev:app
npm run dev:desktop
```

Package for release:

```bash
npm run dist:desktop:mac    # or :win / :linux on each OS
```

## Tech stack

- **Web:** Next.js 16, Turborepo (product app + marketing)
- **Desktop:** Electron (`apps/typefolio-desktop`)
- **Native:** SwiftUI (`apps/typefolio-native`)
- **Auth:** Better Auth + Resend
- **Billing:** Polar (web) + Apple webhooks (iPad)
- **Data:** Neon Postgres + Vercel Blob

https://github.com/interfaces-technology/Typefolio
