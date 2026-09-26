import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";

import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Typefolio — Your fonts, on every device",
  description:
    "Early access. Keep your font library in the cloud and browse it on the web. Pro syncs it to your Mac — founding price £20/year, locked in forever, then £40/year.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={geistMono.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
