import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { apiUrl, marketingUrl } from "@/lib/site";
import { pageShell, primaryLink, secondaryLink } from "@/lib/styles";

export default function MarketingHomePage() {
  return (
    <div style={pageShell}>
      <SiteNav active="home" />

      <header style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#737373",
          }}
        >
          Typefolio
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Your fonts, on every device.
        </h1>
        <p style={{ margin: 0, fontSize: "1.125rem", color: "#525252" }}>
          Personal cloud storage for your typefaces. Upload on the web, sync with the desktop app
          on Mac, Windows, or Linux — and native apps on Mac and iPad.
        </p>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        <a href={apiUrl("/auth/sign-up")} style={primaryLink}>
          Create account
        </a>
        <Link href="/pricing" style={secondaryLink}>
          Pricing
        </Link>
        <Link href="/downloads" style={secondaryLink}>
          Download desktop app
        </Link>
        <a href={apiUrl("/auth/desktop")} style={secondaryLink}>
          Sign in (browser)
        </a>
      </div>

      <p style={{ margin: 0, fontSize: "0.875rem", color: "#737373" }}>
        Web library at{" "}
        <a href={process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:43124"} style={{ color: "#171717" }}>
          {process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "app (local)"}
        </a>
        . Installers and release notes on{" "}
        <Link href="/downloads" style={{ color: "#171717" }}>
          {marketingUrl("/downloads").replace(/^https?:\/\//, "")}
        </Link>
        .
      </p>
    </div>
  );
}
