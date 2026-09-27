import {
  desktopDownloadsFromManifest,
  fetchDesktopReleaseManifest,
} from "@/lib/desktop-manifest";
import { desktopManifestUrl } from "@/lib/desktop-cdn";

function marketingSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_MARKETING_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:43125"
  );
}

export function apiUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:43124";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function marketingUrl(path: string): string {
  const base = marketingSiteOrigin();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export type DesktopPlatform = "macos" | "windows" | "linux";

export type DesktopDownload = {
  platform: DesktopPlatform;
  label: string;
  description: string;
  fileLabel: string;
  href: string | null;
};

function getDesktopDownloadsFromEnv(): {
  version: string;
  downloads: DesktopDownload[];
  hasAnyDownload: boolean;
} {
  const version = process.env.NEXT_PUBLIC_DESKTOP_VERSION?.trim() || "0.1.0";

  const entries: DesktopDownload[] = [
    {
      platform: "macos",
      label: "macOS",
      description: "Apple Silicon and Intel (.dmg)",
      fileLabel: "Typefolio for Mac",
      href: process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_MAC?.trim() || null,
    },
    {
      platform: "windows",
      label: "Windows",
      description: "Windows 10+ (.exe installer)",
      fileLabel: "Typefolio for Windows",
      href: process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_WIN?.trim() || null,
    },
    {
      platform: "linux",
      label: "Linux",
      description: "AppImage or .deb",
      fileLabel: "Typefolio for Linux",
      href: process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_LINUX?.trim() || null,
    },
  ];

  return {
    version,
    downloads: entries,
    hasAnyDownload: entries.some((item) => Boolean(item.href)),
  };
}

/** Prefer Vercel Blob manifest; fall back to per-platform env URLs. */
export async function getDesktopDownloads(): Promise<{
  version: string;
  downloads: DesktopDownload[];
  hasAnyDownload: boolean;
  source: "blob-manifest" | "env" | "none";
}> {
  const origin = marketingSiteOrigin();
  const manifestUrl = desktopManifestUrl(origin);
  const manifest = await fetchDesktopReleaseManifest(manifestUrl);
  if (manifest) {
    const fromBlob = desktopDownloadsFromManifest(manifest, origin);
    if (fromBlob.hasAnyDownload) {
      return { ...fromBlob, source: "blob-manifest" };
    }
  }

  const fromEnv = getDesktopDownloadsFromEnv();
  return {
    ...fromEnv,
    source: fromEnv.hasAnyDownload ? "env" : "none",
  };
}
