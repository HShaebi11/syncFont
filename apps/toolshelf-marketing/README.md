# Toolshelf marketing (`toolshelf.supply`)

Marketing-only waitlist site. No database or product secrets required for a minimal deploy.

## Develop

```bash
npm install
npm run dev -w @toolshelf/marketing
```

Open http://localhost:43126

## Vercel

- **Root directory:** `apps/toolshelf-marketing`
- **Build:** `cd ../.. && turbo run build --filter=@toolshelf/marketing`
- **Domain:** `toolshelf.supply`

## Environment (production)

| Variable | Required | Purpose |
|----------|----------|---------|
| `RESEND_API_KEY` | Yes | Waitlist API |
| `TOOLSHELF_RESEND_AUDIENCE_ID` | One of* | Resend audience for signups |
| `TOOLSHELF_WAITLIST_NOTIFY_EMAIL` | One of* | Notify inbox on each signup |
| `RESEND_FROM` | Recommended | Verified sender |
| `NEXT_PUBLIC_SITE_URL` | Recommended | `https://toolshelf.supply` |

\*At least one of audience ID or notify email must be set.

## Related

Project docs live in the Cursor Toolshelf project store (`toolshelf-launch-checklist.md`).
