function marketingOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_MARKETING_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:43125"
  );
}

export function marketingDownloadsUrl(): string {
  return `${marketingOrigin()}/?download=1`;
}

export function marketingLegalUrl(path = "/legal"): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${marketingOrigin()}${suffix}`;
}
