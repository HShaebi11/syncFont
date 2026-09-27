"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import type { DesktopDownload } from "@/lib/site";
import { detectDesktopOs, startFileDownload, type DetectedOs } from "@/lib/detect-os";

const OS_LABEL: Record<DetectedOs, string> = {
  macos: "Mac",
  windows: "Windows",
  linux: "Linux",
  mobile: "this device",
  unknown: "your computer",
};

export function DownloadDesktop({
  version,
  downloads,
  hasAnyDownload,
  autoOpen = false,
}: {
  version: string;
  downloads: DesktopDownload[];
  hasAnyDownload: boolean;
  autoOpen?: boolean;
}) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [detected, setDetected] = useState<DetectedOs>("unknown");

  useEffect(() => {
    setMounted(true);
    setDetected(detectDesktopOs());
  }, []);

  const match = downloads.find((item) => item.platform === detected && item.platform === "macos");
  const canAuto = Boolean(match?.href);

  const options = [
    ...downloads.map((item) =>
      item.platform === "macos" ? item : { ...item, href: null },
    ),
    {
      platform: "ipad",
      label: "iPad",
      description: "Native companion app",
      fileLabel: "Typefolio for iPad",
      href: null,
    },
  ];

  const openLightbox = useCallback(
    (shouldDownload: boolean) => {
      setOpen(true);
      if (shouldDownload && match?.href) {
        startFileDownload(match.href);
      }
    },
    [match?.href],
  );

  useEffect(() => {
    if (!autoOpen || !mounted) {
      return;
    }
    openLightbox(canAuto);
  }, [autoOpen, canAuto, mounted, openLightbox]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const headline = canAuto
    ? `Downloading Typefolio for ${OS_LABEL[detected]}`
    : detected === "mobile"
      ? "Desktop app is for Mac, Windows, and Linux"
      : hasAnyDownload
        ? "Choose your installer"
        : "Installers aren’t published yet";

  const lightbox =
    mounted && open
      ? createPortal(
          <div
            role="presentation"
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 80,
              display: "grid",
              placeItems: "center",
              padding: "1.5rem",
              background: "rgba(0, 0, 0, 0.72)",
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "min(28rem, 100%)",
                background: "#fff",
                color: "#000",
                borderRadius: "1rem",
                padding: "1.5rem",
                boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
              }}
            >
              <p
                id={titleId}
                style={{
                  margin: 0,
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                {headline}
              </p>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", color: "#525252", lineHeight: 1.5 }}>
                Version {version}. We pick Mac, Windows, or Linux from your browser. Grab another
                build below if you need it.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  margin: "1.25rem 0 0",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {options.map((item) => {
                  const recommended = item.platform === detected;
                  return (
                    <li key={item.platform}>
                      {item.href ? (
                        <a
                          href={item.href}
                          download
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "0.75rem",
                            alignItems: "center",
                            padding: "0.85rem 1rem",
                            borderRadius: "0.75rem",
                            textDecoration: "none",
                            color: recommended ? "#fff" : "#000",
                            background: recommended ? "#000" : "#fff",
                            border: recommended ? "1px solid #000" : "1px solid #e5e5e5",
                          }}
                        >
                          <span>
                            <span style={{ display: "block", fontWeight: 600, fontSize: "0.875rem" }}>
                              {item.label}
                              {recommended ? " · detected" : ""}
                            </span>
                            <span style={{ display: "block", fontSize: "0.75rem", opacity: 0.75 }}>
                              {item.description}
                            </span>
                          </span>
                          <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Download</span>
                        </a>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "0.75rem",
                            alignItems: "center",
                            padding: "0.85rem 1rem",
                            borderRadius: "0.75rem",
                            border: "1px solid #e5e5e5",
                            background: "#fff",
                            opacity: 0.7,
                          }}
                        >
                          <span>
                            <span style={{ display: "block", fontWeight: 600, fontSize: "0.875rem" }}>
                              {item.label}
                            </span>
                            <span style={{ display: "block", fontSize: "0.75rem", color: "#737373" }}>
                              {item.description}
                            </span>
                          </span>
                          <span style={{ fontSize: "0.8125rem" }}>Coming soon</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  border: 0,
                  background: "transparent",
                  color: "#737373",
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                Close
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => openLightbox(canAuto)}
        style={{
          color: "#a3a3a3",
          fontSize: "0.9375rem",
          background: "none",
          border: 0,
          borderBottom: "1px solid #737373",
          padding: "0 0 0.1rem",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Download desktop
      </button>
      {lightbox}
    </>
  );
}
