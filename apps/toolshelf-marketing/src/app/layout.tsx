import type { Metadata } from "next";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolshelf.supply";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Toolshelf — sharp utilities for people who make things",
  description:
    "Toolshelf is a shelf of sharp utilities for people who make things. Join the waitlist for Typefolio, Wholeboard, and Shelf Pass.",
  openGraph: {
    title: "Toolshelf",
    description:
      "A shelf of sharp utilities for people who make things. One account. Shelf Pass or pay per tool.",
    siteName: "Toolshelf",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
