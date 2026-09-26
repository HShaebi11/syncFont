import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "./globals.css";
import { cn } from "@/lib/utils";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Typefolio",
  description: "A living typography library.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(geistMono.variable, "font-sans")}
    >
      <body className="min-h-svh antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
