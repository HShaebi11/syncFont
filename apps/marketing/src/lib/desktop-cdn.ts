/** Map Vercel Blob URLs to same-origin /desktop/releases/* on the marketing domain. */
export function blobUrlToDesktopPublicUrl(
  url: string,
  marketingSiteOrigin: string,
): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (!parsed.pathname.startsWith("/desktop/releases/")) {
      return trimmed;
    }
    const base = marketingSiteOrigin.replace(/\/$/, "");
    return `${base}${parsed.pathname}${parsed.search}`;
  } catch {
    return trimmed;
  }
}

export function desktopManifestUrl(marketingSiteOrigin: string): string {
  const override = process.env.DESKTOP_MANIFEST_URL?.trim();
  if (override) {
    return override;
  }
  const blobOrigin = process.env.DESKTOP_BLOB_PUBLIC_ORIGIN?.trim().replace(/\/$/, "");
  if (blobOrigin) {
    return `${blobOrigin}/desktop/releases/manifest.json`;
  }
  const base = marketingSiteOrigin.replace(/\/$/, "");
  return `${base}/desktop/releases/manifest.json`;
}
