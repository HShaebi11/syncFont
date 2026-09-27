"use client";

import { useEffect, useMemo, useState } from "react";

import type { DesktopDownload } from "@/lib/site";
import { detectDesktopOs, startFileDownload, type DetectedOs } from "@/lib/detect-os";

const APP_LABEL: Record<DetectedOs, string> = {
  macos: "Download Mac app",
  windows: "Download Windows app",
  linux: "Download Linux app",
  mobile: "Download Mac app",
  unknown: "Download Mac app",
};

export function DownloadDesktop({
  downloads,
  autoOpen = false,
}: {
  version?: string;
  downloads: DesktopDownload[];
  hasAnyDownload?: boolean;
  autoOpen?: boolean;
}) {
  const [detected, setDetected] = useState<DetectedOs>("unknown");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDetected(detectDesktopOs());
  }, []);

  const target = useMemo(() => {
    const byOs = downloads.find((item) => item.platform === detected && item.href);
    if (byOs?.href) {
      return byOs;
    }
    return downloads.find((item) => item.platform === "macos" && item.href) ?? null;
  }, [detected, downloads]);

  const label =
    target?.platform === "macos"
      ? "Download Mac app"
      : target?.platform === "windows"
        ? "Download Windows app"
        : target?.platform === "linux"
          ? "Download Linux app"
          : APP_LABEL[detected];

  useEffect(() => {
    if (!autoOpen || !mounted || !target?.href) {
      return;
    }
    startFileDownload(target.href);
  }, [autoOpen, mounted, target?.href]);

  const style = {
    color: "#a3a3a3",
    background: "none",
    border: 0,
    borderBottom: "1px solid #737373",
    padding: "0 0 0.1rem",
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "none",
  } as const;

  if (target?.href) {
    return (
      <a href={target.href} download rel="noopener noreferrer" className="tf-button" style={style}>
        {label}
      </a>
    );
  }

  return (
    <span className="tf-button" style={{ ...style, cursor: "default", borderBottom: 0 }}>{label}</span>
  );
}
