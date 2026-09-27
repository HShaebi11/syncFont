import Link from "next/link";

import { TypeSpecimen } from "@/components/auth/type-specimen";
import { brandFontClassName } from "@/lib/brand-fonts";
import { marketingLegalUrl } from "@/lib/marketing";

const LEGAL = [
  { href: "/legal/privacy", label: "Privacy policy" },
  { href: "/legal/terms", label: "Terms of service" },
  { href: "/legal/cookies", label: "Cookie policy" },
  { href: "/legal/refunds", label: "Refunds and cancellation" },
] as const;

export function AuthSplitLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label="Typefolio"
      className={brandFontClassName}
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
        className="auth-split"
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
            gap: "1.25rem",
            padding: "5.5rem 1.75rem 5rem",
            minWidth: 0,
            maxWidth: "32rem",
            overflowY: "auto",
          }}
        >
          <h1 className="tf-title" style={{ margin: 0 }}>
            {title}
          </h1>
          {description ? (
            <p className="tf-lede" style={{ margin: 0, color: "#a3a3a3" }}>
              {description}
            </p>
          ) : null}
          {children}
        </div>
        <TypeSpecimen />
      </div>

      <nav
        aria-label="Legal"
        className="auth-legal tf-small"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          zIndex: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.65rem 1rem",
          padding: "1.25rem 1.75rem",
        }}
      >
        {LEGAL.map((item) => (
          <Link
            key={item.href}
            href={marketingLegalUrl(item.href)}
            style={{ color: "#737373", textDecoration: "none" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
