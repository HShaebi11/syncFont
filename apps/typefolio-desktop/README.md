# Typefolio desktop (Electron)

Cross-platform desktop client (macOS, Windows, Linux): product library UI, background font sync, and OS font installation.

## Requirements

- Node 20+
- Typefolio API running locally or a deployed API URL

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `TYPEFOLIO_API_URL` | `http://127.0.0.1:43124` | Product app host: `/api/*`, `/auth/desktop` |
| `TYPEFOLIO_WEB_APP_URL` | `http://127.0.0.1:43124` | Fallback link for account/settings in browser |

## Auth and billing (system browser)

- **Sign in:** opens `{API}/auth/desktop` in your browser; the app receives a bearer token via a localhost callback (or `typefolio://` when installed).
- **Sign up / plan management:** always in the browser (`openExternal`), not inside Electron WebViews.

## Develop

From the repo root:

```bash
npm run dev:app          # product app on :43124
npm run dev:desktop      # Electron + Vite renderer
```

### macOS: “Malware Blocked” on Electron.app

Apple sometimes flags the **stock Electron binary** from npm (not your Typefolio code). macOS may move `node_modules/electron/dist/Electron.app` to the Bin, which causes `ENOENT` when starting dev.

From the repo root:

```bash
npm run fix:electron-macos -w typefolio-desktop
# or: npm rebuild electron -w typefolio-desktop && xattr -cr node_modules/electron/dist/Electron.app
npm run dev:desktop
```

`dev:desktop` runs `ensure-electron.mjs` first (reinstall if missing, strip quarantine, ad-hoc sign on macOS).

If the alert still appears: **System Settings → Privacy & Security** → look for **Open Anyway** for Electron, then run `fix:electron-macos` again. Empty **Bin** if macOS moved Electron there.

Packaged **`release/.../Typefolio.app`** builds should be signed/notarized for distribution; dev uses the generic Electron runtime.

## Build and package

```bash
npm run build -w typefolio-desktop
npm run dist:desktop:mac    # macOS dmg/zip (run on macOS)
npm run dist:desktop:win    # Windows NSIS (run on Windows, or use CI)
npm run dist:desktop:linux  # AppImage + deb (run on Linux, or use CI)
```

On Apple Silicon Macs, **Windows NSIS** and **Linux AppImage** often fail locally (electron-builder ships x64-only helper binaries). Use a Windows/Linux machine or the repo’s **Desktop release** GitHub Action to produce those installers.

All platforms publish to the same manifest; download links use **`https://typefolio.app/desktop/releases/…`**.

Artifacts land in `apps/typefolio-desktop/release/`.

### Publish to Vercel Blob (production downloads)

From the repo root (uses the API project’s `BLOB_READ_WRITE_TOKEN`):

```bash
npm run dist:desktop:mac
npm run upload:desktop:blob
```

Set `NEXT_PUBLIC_DESKTOP_MANIFEST_URL` on the **typefolio-marketing** Vercel project to the manifest URL the script prints. See `docs/DEPLOYMENT.md`.


- **Main process:** auth callback server, sync loop, font install paths per OS, file uploads, billing portal `openExternal`.
- **Renderer:** React Router port of `apps/app` workspace UI; API calls via `@typefolio/core/api` + `configureTypefolioApi` (bearer token).
