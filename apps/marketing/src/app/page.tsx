import type { Metadata } from "next";

import { getLaunchTrialDays } from "@typefolio/core/billing/polar-trial";
import { formatGbpPerYearShort, LAUNCH_PRICE_GBP, PRO_ANNUAL_PRICE_GBP } from "@typefolio/core/billing/prices";
import { isLaunchOfferActive } from "@typefolio/core/entitlements";

import { DownloadDesktop } from "@/components/download-desktop";
import { HomeLegalLinks } from "@/components/legal-chrome";
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
        <p className="tf-logo" style={{ margin: 0, color: "#fff" }}>
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
          <h1 className="tf-display" style={{ margin: 0, maxWidth: "11ch" }}>
            Your fonts, on every device.
          </h1>
          <p className="tf-lede" style={{ margin: 0, color: "#a3a3a3", maxWidth: "32rem" }}>
            Upload .ttf, .otf, .woff, and .woff2 once. Sync and install on Mac now — Windows, Linux,
            and iPad are coming soon. A utility for fonts you already own.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
            <a
              href={apiUrl("/auth/sign-up")}
              className="tf-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                color: "#000",
                textDecoration: "none",
                padding: "0.85rem 1.4rem",
                borderRadius: "999px",
                border: "1px solid #fff",
              }}
            >
              {cta}
            </a>
            <a
              href={apiUrl("/auth/desktop")}
              className="tf-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                color: "#fff",
                textDecoration: "none",
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
          <p className="tf-meta" style={{ margin: 0, color: "#737373" }}>
            {proof}
          </p>
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
            className="tf-specimen-aa"
            style={{
              margin: 0,
              position: "absolute",
              top: "-4%",
              left: "-4%",
              color: "#000",
              userSelect: "none",
            }}
          >
            Aa
          </p>
          <p
            className="tf-specimen-num"
            style={{
              margin: 0,
              position: "absolute",
              bottom: "8%",
              right: "-2%",
              color: "#000",
              userSelect: "none",
            }}
          >
            123
          </p>
          <p
            className="tf-specimen-meta"
            style={{
              margin: 0,
              position: "absolute",
              top: "52%",
              left: "10%",
              color: "#000",
              userSelect: "none",
            }}
          >
            .ttf  .otf  .woff2
          </p>
        </aside>
      </div>
      <div
        className="home-legal"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          zIndex: 2,
          padding: "1.25rem 1.75rem",
        }}
      >
        <HomeLegalLinks />
      </div>
    </section>
  );
}
