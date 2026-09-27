import type { Metadata } from "next";
import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { getDesktopDownloads } from "@/lib/site";
import { disabledButton, pageShell, primaryLink, secondaryLink } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Download Typefolio — Mac, Windows, Linux",
  description:
    "Download the Typefolio desktop app to sync and install fonts on macOS, Windows, and Linux.",
};

export const revalidate = 300;

export default async function DownloadsPage() {
  const { version, downloads, hasAnyDownload } = await getDesktopDownloads();

  return (
    <div style={pageShell}>
      <SiteNav active="downloads" />

      <header style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Download Typefolio
        </h1>
        <p style={{ margin: 0, fontSize: "1.0625rem", color: "#525252", maxWidth: "36rem" }}>
          Desktop app for your font library — sync, specimen studio, and collections. Sign in
          with your browser; billing stays on the web.
        </p>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#737373" }}>
          Version {version}
          {!hasAnyDownload ? " · Installers not published yet for this environment" : null}
        </p>
      </header>

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {downloads.map((item) => (
          <li
            key={item.platform}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: "0.75rem",
              padding: "1.25rem 1.5rem",
              background: "#fff",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>{item.label}</p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "#737373" }}>
                {item.description}
              </p>
            </div>
            {item.href ? (
              <a href={item.href} style={primaryLink} download rel="noopener noreferrer">
                Download {item.label}
              </a>
            ) : (
              <span style={disabledButton}>Coming soon</span>
            )}
          </li>
        ))}
      </ul>

      {!hasAnyDownload ? (
        <section
          style={{
            borderRadius: "0.75rem",
            border: "1px dashed #d4d4d4",
            padding: "1.25rem 1.5rem",
            fontSize: "0.875rem",
            color: "#525252",
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: 0 }}>
            Installers are served at{" "}
            <code style={{ fontSize: "0.8125rem" }}>https://typefolio.app/desktop/releases/…</code>{" "}
            (proxied from Vercel Blob). Set{" "}
            <code style={{ fontSize: "0.8125rem" }}>DESKTOP_BLOB_PUBLIC_ORIGIN</code> on{" "}
            <strong>typefolio-marketing</strong>, then{" "}
            <code style={{ fontSize: "0.8125rem" }}>npm run upload:desktop:blob:marketing</code>.
          </p>
        </section>
      ) : null}

      <p style={{ margin: 0, fontSize: "0.875rem" }}>
        <Link href="/" style={secondaryLink}>
          Back to home
        </Link>
      </p>
    </div>
  );
}
