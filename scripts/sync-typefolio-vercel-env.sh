#!/usr/bin/env bash
# Push Typefolio env vars to Vercel from repo root .env.local (secrets) + production URLs.
# Usage: ./scripts/sync-typefolio-vercel-env.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCOPE="interfaces-main"
TARGETS=(production preview development)

# Run via: npm run vercel:env:sync (loads repo root .env.local with dotenv-cli)

add_plain() {
  local project="$1" key="$2" value="$3"
  if [[ -z "${value// }" ]]; then
    echo "skip ${project} ${key} (empty)"
    return 0
  fi
  for env in "${TARGETS[@]}"; do
    vercel env add "$key" "$env" \
      --project "$project" \
      --scope "$SCOPE" \
      --value "$value" \
      --force \
      --yes \
      >/dev/null
  done
  echo "ok ${project} ${key}"
}

add_sensitive() {
  local project="$1" key="$2" value="$3"
  if [[ -z "${value// }" ]]; then
    echo "skip ${project} ${key} (empty)"
    return 0
  fi
  for env in production preview; do
    vercel env add "$key" "$env" \
      --project "$project" \
      --scope "$SCOPE" \
      --value "$value" \
      --sensitive \
      --force \
      --yes \
      >/dev/null
  done
  # Vercel rejects --sensitive on the Development environment.
  vercel env add "$key" development \
    --project "$project" \
    --scope "$SCOPE" \
    --value "$value" \
    --force \
    --yes \
    >/dev/null
  echo "ok ${project} ${key} (sensitive)"
}

# Production hostnames — do not read from .env.local (that file is for local dev ports).
MARKETING_URL="https://typefolio.app"
APP_URL="https://app.typefolio.app"
# API and auth share the product app host (same-origin /api/*).
API_URL="$APP_URL"
AUTH_URL="$APP_URL"

echo "=== typefolio-marketing ==="
add_plain typefolio-marketing NEXT_PUBLIC_MARKETING_URL "$MARKETING_URL"
add_plain typefolio-marketing NEXT_PUBLIC_API_URL "$API_URL"
add_plain typefolio-marketing NEXT_PUBLIC_APP_URL "$APP_URL"
add_plain typefolio-marketing DESKTOP_BLOB_PUBLIC_ORIGIN "${DESKTOP_BLOB_PUBLIC_ORIGIN:-}"
add_plain typefolio-marketing NEXT_PUBLIC_DESKTOP_VERSION "${NEXT_PUBLIC_DESKTOP_VERSION:-0.1.0}"

echo "=== typefolio-app ==="
add_plain typefolio-app NEXT_PUBLIC_MARKETING_URL "$MARKETING_URL"
add_plain typefolio-app NEXT_PUBLIC_APP_URL "$APP_URL"
add_plain typefolio-app NEXT_PUBLIC_API_URL "$API_URL"
add_plain typefolio-app BETTER_AUTH_URL "$AUTH_URL"
add_sensitive typefolio-app DATABASE_URL "${DATABASE_URL:-}"
add_sensitive typefolio-app BLOB_READ_WRITE_TOKEN "${BLOB_READ_WRITE_TOKEN:-}"
add_sensitive typefolio-app BETTER_AUTH_SECRET "${BETTER_AUTH_SECRET:-}"
add_plain typefolio-app RESEND_FROM_EMAIL "${RESEND_FROM_EMAIL:-Typefolio <hello@typefolio.app>}"
add_sensitive typefolio-app RESEND_API_KEY "${RESEND_API_KEY:-}"
add_plain typefolio-app TYPEFOLIO_FOUNDER_NAME "${TYPEFOLIO_FOUNDER_NAME:-Hamza}"
add_plain typefolio-app TYPEFOLIO_FOUNDER_FROM_EMAIL "${TYPEFOLIO_FOUNDER_FROM_EMAIL:-}"
add_sensitive typefolio-app POLAR_ACCESS_TOKEN "${POLAR_ACCESS_TOKEN:-}"
add_sensitive typefolio-app POLAR_WEBHOOK_SECRET "${POLAR_WEBHOOK_SECRET:-}"
add_plain typefolio-app POLAR_SERVER "${POLAR_SERVER:-sandbox}"
add_plain typefolio-app POLAR_PRODUCT_ANNUAL "${POLAR_PRODUCT_ANNUAL:-}"
add_plain typefolio-app POLAR_PRODUCT_LAUNCH "${POLAR_PRODUCT_LAUNCH:-}"
add_plain typefolio-app POLAR_PRODUCT_MONTHLY "${POLAR_PRODUCT_MONTHLY:-}"
add_plain typefolio-app LAUNCH_OFFER_ACTIVE "${LAUNCH_OFFER_ACTIVE:-true}"
add_plain typefolio-app LAUNCH_TRIAL_DAYS "${LAUNCH_TRIAL_DAYS:-7}"
add_plain typefolio-app POLAR_USAGE_EVENTS "${POLAR_USAGE_EVENTS:-true}"
add_plain typefolio-app ADMIN_USER_IDS "${ADMIN_USER_IDS:-}"
add_plain typefolio-app INFRA_PLATFORM_FIXED_GBP_MONTHLY "${INFRA_PLATFORM_FIXED_GBP_MONTHLY:-35}"
add_plain typefolio-app GOOGLE_CLIENT_ID "${GOOGLE_CLIENT_ID:-}"
add_sensitive typefolio-app GOOGLE_CLIENT_SECRET "${GOOGLE_CLIENT_SECRET:-}"

echo "Done. Redeploy typefolio-app if you added Resend, Polar, or founder email vars."
