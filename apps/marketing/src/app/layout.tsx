import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Typefolio — Your fonts, on every device",
  description:
    "Personal cloud font library. Upload once, sync and install on Mac, Windows, Linux, and iPad.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          color: "#fff",
          background: "#000",
        }}
      >
        {children}
      </body>
    </html>
  );
}
