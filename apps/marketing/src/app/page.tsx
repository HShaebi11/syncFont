import type { Metadata } from "next";

import { getLaunchTrialDays } from "@typefolio/core/billing/polar-trial";
import { formatGbpPerYearShort, LAUNCH_PRICE_GBP, PRO_ANNUAL_PRICE_GBP } from "@typefolio/core/billing/prices";
import { isLaunchOfferActive } from "@typefolio/core/entitlements";

import { DownloadDesktop } from "@/components/download-desktop";
import { apiUrl, getDesktopDownloads } from "@/lib/site";

export const metadata: Metadata = {
  title: "Typefolio — Your fonts, on every device",
  description:
    "Personal cloud font library with sync. Upload once. Auto-install on Mac, Windows, Linux, and iPad.",
};

export default async function MarketingHomePage({
  searchParams,
}: {
  searchParams: Promise<{ download?: string }>;
}) {
  const params = await searchParams;
  const catalog = await getDesktopDownloads();
  const launchActive = isLaunchOfferActive();
  const trialDays = getLaunchTrialDays();
  const price = launchActive
    ? formatGbpPerYearShort(LAUNCH_PRICE_GBP)
    : formatGbpPerYearShort(PRO_ANNUAL_PRICE_GBP);
  const cta = launchActive ? "Start trial" : "Get started";
  const proof = launchActive
    ? `${trialDays}-day trial · then ${price}, locked in while you subscribe`
    : `Pro ${price} · cloud library, sync, and install`;

  return (
    <section
      aria-label="Typefolio"
      style={{
        position: "relative",
        boxSizing: "border-box",
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        color: "#fff",
        background: "#000",
      }}
    >
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 1.5rem",
          mixBlendMode: "difference",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "0.8125rem",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#fff",
          }}
        >
          Typefolio
        </p>
      </header>

      <div
        className="home-split"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1.5rem",
            padding: "5.5rem 1.75rem",
            minWidth: 0,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2.25rem, 6vw, 4.75rem)",
              fontWeight: 560,
              letterSpacing: "-0.045em",
              lineHeight: 0.95,
              maxWidth: "11ch",
            }}
          >
            Your fonts, on every device.
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "clamp(0.95rem, 1.4vw, 1.125rem)",
              lineHeight: 1.5,
              color: "#a3a3a3",
              maxWidth: "32rem",
            }}
          >
            Upload .ttf, .otf, .woff, and .woff2 once. Sync and install on Mac now — Windows, Linux,
            and iPad are coming soon. A utility for fonts you already own.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
            <a
              href={apiUrl("/auth/sign-up")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                color: "#000",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9375rem",
                padding: "0.85rem 1.4rem",
                borderRadius: "999px",
                border: "1px solid #fff",
              }}
            >
              {cta}
            </a>
            <a
              href={apiUrl("/auth/desktop")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9375rem",
                padding: "0.85rem 1.4rem",
                borderRadius: "999px",
                border: "1px solid #fff",
              }}
            >
              Sign in
            </a>
            <DownloadDesktop
              version={catalog.version}
              downloads={catalog.downloads}
              hasAnyDownload={catalog.hasAnyDownload}
              autoOpen={params.download === "1"}
            />
          </div>
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "#737373" }}>{proof}</p>
        </div>

        <aside
          className="home-specimen"
          aria-hidden="true"
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#fff",
            color: "#000",
            minWidth: 0,
            height: "100%",
          }}
        >
          <p
            style={{
              margin: 0,
              position: "absolute",
              top: "-4%",
              left: "-4%",
              fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
              fontSize: "clamp(10rem, 32vw, 22rem)",
              fontWeight: 400,
              lineHeight: 0.8,
              letterSpacing: "-0.06em",
              color: "#000",
              userSelect: "none",
            }}
          >
            Aa
          </p>
          <p
            style={{
              margin: 0,
              position: "absolute",
              bottom: "8%",
              right: "-2%",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: "clamp(3.5rem, 9vw, 7.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.05em",
              lineHeight: 0.9,
              color: "#000",
              userSelect: "none",
            }}
          >
            123
          </p>
          <p
            style={{
              margin: 0,
              position: "absolute",
              top: "52%",
              left: "10%",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "clamp(0.9rem, 1.6vw, 1.15rem)",
              letterSpacing: "0.04em",
              color: "#000",
              userSelect: "none",
            }}
          >
            .ttf  .otf  .woff2
          </p>
        </aside>
      </div>
    </section>
  );
}
