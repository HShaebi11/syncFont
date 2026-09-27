import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_EFFECTIVE, LEGAL_PAGES } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Legal — Typefolio",
  description: "Privacy, terms, cookies, and refunds for Typefolio.",
};

export default function LegalIndexPage() {
  return (
    <div style={{ maxWidth: "40rem", padding: "2.5rem 1.5rem" }}>
      <h1 className="tf-title" style={{ margin: 0 }}>
        Legal
      </h1>
      <p className="tf-lede" style={{ margin: "0.75rem 0 0", color: "#a3a3a3" }}>
        Policies for the Typefolio website, web app, and desktop apps. Effective {LEGAL_EFFECTIVE}.
      </p>
      <ul style={{ listStyle: "none", margin: "2rem 0 0", padding: 0, display: "grid", gap: "0.75rem" }}>
        {LEGAL_PAGES.map((page) => (
          <li key={page.slug}>
            <Link
              href={`/legal/${page.slug}`}
              style={{
                display: "block",
                padding: "1rem 0",
                borderBottom: "1px solid #262626",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              <span className="tf-heading" style={{ display: "block" }}>
                {page.title}
              </span>
              <span className="tf-meta" style={{ display: "block", marginTop: "0.25rem", color: "#737373" }}>
                {page.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
