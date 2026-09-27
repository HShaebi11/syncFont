export type DetectedOs = "macos" | "windows" | "linux" | "mobile" | "unknown";

export function detectDesktopOs(): DetectedOs {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  const ua = navigator.userAgent;
  const platform = navigator.platform || "";
  const touch = navigator.maxTouchPoints || 0;

  if (/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return "mobile";
  }
  if (/iPhone|iPod/i.test(ua)) {
    return "mobile";
  }
  if (/iPad/i.test(ua) || (platform === "MacIntel" && touch > 1)) {
    return "mobile";
  }
  if (/Win/i.test(ua) || /Win/i.test(platform)) {
    return "windows";
  }
  if (/Mac/i.test(ua) || /Mac/i.test(platform)) {
    return "macos";
  }
  if (/Linux/i.test(ua) || /Linux/i.test(platform)) {
    return "linux";
  }
  return "unknown";
}

export function startFileDownload(href: string) {
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noopener noreferrer";
  link.download = "";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
