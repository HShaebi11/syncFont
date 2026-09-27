export function marketingDownloadsUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_MARKETING_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:43125";
  return `${base}/?download=1`;
}
