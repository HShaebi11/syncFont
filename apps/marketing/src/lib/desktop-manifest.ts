import type { DesktopDownload, DesktopPlatform } from "@/lib/site";
import { blobUrlToDesktopPublicUrl } from "@/lib/desktop-cdn";

export type DesktopReleaseManifest = {
  version: string;
  publishedAt?: string;
  downloads: Partial<
    Record<
      DesktopPlatform,
      {
        url: string;
        fileName?: string;
      }
    >
  >;
};

const PLATFORM_META: Record<
  DesktopPlatform,
  Pick<DesktopDownload, "label" | "description" | "fileLabel">
> = {
  macos: {
    label: "macOS",
    description: "Apple Silicon and Intel (.dmg)",
    fileLabel: "Typefolio for Mac",
  },
  windows: {
    label: "Windows",
    description: "Windows 10+ (.exe installer)",
    fileLabel: "Typefolio for Windows",
  },
  linux: {
    label: "Linux",
    description: "AppImage or .deb",
    fileLabel: "Typefolio for Linux",
  },
};

const PLATFORMS: DesktopPlatform[] = ["macos", "windows", "linux"];

export function desktopDownloadsFromManifest(
  manifest: DesktopReleaseManifest,
  marketingSiteOrigin: string,
): {
  version: string;
  downloads: DesktopDownload[];
  hasAnyDownload: boolean;
} {
  const downloads: DesktopDownload[] = PLATFORMS.map((platform) => {
    const meta = PLATFORM_META[platform];
    const entry = manifest.downloads[platform];
    const rawUrl = entry?.url?.trim() || null;
    return {
      platform,
      ...meta,
      href: rawUrl
        ? blobUrlToDesktopPublicUrl(rawUrl, marketingSiteOrigin)
        : null,
    };
  });

  return {
    version: manifest.version?.trim() || "0.1.0",
    downloads,
    hasAnyDownload: downloads.some((item) => Boolean(item.href)),
  };
}

export async function fetchDesktopReleaseManifest(
  manifestUrl: string,
): Promise<DesktopReleaseManifest | null> {
  try {
    const response = await fetch(manifestUrl, {
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as DesktopReleaseManifest;
  } catch {
    return null;
  }
}
