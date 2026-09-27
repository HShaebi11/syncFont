import Link from "next/link";

import { LEGAL_PAGES, type LegalSlug } from "@/lib/legal";

const linkStyle: React.CSSProperties = {
  color: "#a3a3a3",
  textDecoration: "none",
};

export function LegalHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "1.25rem 1.5rem",
        borderBottom: "1px solid #262626",
      }}
    >
      <Link
        href="/"
        className="tf-logo"
        style={{
          color: "#fff",
          textDecoration: "none",
        }}
      >
        Typefolio
      </Link>
      <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem 1.1rem" }}>
        {LEGAL_PAGES.map((page) => (
          <Link key={page.slug} href={`/legal/${page.slug}`} className="tf-small" style={linkStyle}>
            {page.title}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function LegalFooter({ current }: { current?: LegalSlug }) {
  return (
    <footer
      className="tf-small"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem 1.25rem",
        padding: "2rem 1.5rem 3rem",
        borderTop: "1px solid #262626",
        color: "#737373",
      }}
    >
      <Link href="/" className="tf-small" style={linkStyle}>
        Home
      </Link>
      {LEGAL_PAGES.map((page) => (
        <Link
          key={page.slug}
          href={`/legal/${page.slug}`}
          className="tf-small"
          style={{
            ...linkStyle,
            color: current === page.slug ? "#fff" : "#a3a3a3",
          }}
        >
          {page.title}
        </Link>
      ))}
    </footer>
  );
}

export function HomeLegalLinks() {
  return (
    <nav
      className="tf-small"
      aria-label="Legal"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.65rem 1rem",
        margin: 0,
      }}
    >
      {LEGAL_PAGES.map((page) => (
        <Link
          key={page.slug}
          href={`/legal/${page.slug}`}
          style={{ color: "#737373", textDecoration: "none" }}
          className="tf-small"
        >
          {page.title}
        </Link>
      ))}
    </nav>
  );
}
