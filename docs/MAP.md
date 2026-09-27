# Typefolio map

Turborepo: shared core + product app (UI + API) + marketing + native clients. Fonts live in Vercel Blob; users and metadata live in Neon.

**Product strategy:** [`docs/PRODUCT.md`](PRODUCT.md)  
**Deploy split:** [`docs/DEPLOYMENT.md`](DEPLOYMENT.md)

## Layout

```
packages/core/          @typefolio/core — DB, auth, billing, storage, entitlements
apps/app/               @typefolio/app — product UI, /api/*, webhooks, /auth/desktop
apps/marketing/         @typefolio/marketing — landing & pricing shell
apps/typefolio-native/  SwiftUI macOS + iPadOS
apps/typefolio-desktop/ Electron macOS + Windows + Linux
```

## Local ports

| Package | Port |
|---------|------|
| App (UI + API) | 43124 |
| Marketing | 43125 |

## Where new things go

| Change | Location |
|--------|----------|
| API route | `apps/app/src/app/api/.../route.ts` |
| Native browser sign-in | `apps/app/src/app/auth/desktop/` |
| Marketing page | `apps/marketing/src/app/` |
| Shared server logic | `packages/core/src/lib/` |
| Native SwiftUI | `apps/typefolio-native/Shared/`, `macOS/`, `iOS/` |
| Product web UI | `apps/app/src/` |
| Electron desktop | `apps/typefolio-desktop/src/` |

## Auth

- Better Auth runs on the **product app** (`BETTER_AUTH_URL` / `NEXT_PUBLIC_API_URL` → same host as `NEXT_PUBLIC_APP_URL`).
- macOS / iPad / desktop open **`{APP}/auth/desktop`** in the browser, then receive a bearer token via localhost or `typefolio://` callback.
- Native apps use bearer tokens from the desktop auth flow.
