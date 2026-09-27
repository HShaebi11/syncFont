import Link from "next/link";

import { navLink, siteNav } from "@/lib/styles";

export function SiteNav({ active }: { active: "home" | "downloads" }) {
  return (
    <nav style={siteNav} aria-label="Site">
      <Link
        href="/"
        style={active === "home" ? { ...navLink, color: "#171717", fontWeight: 500 } : navLink}
      >
        Home
      </Link>
      <Link
        href="/downloads"
        style={
          active === "downloads" ? { ...navLink, color: "#171717", fontWeight: 500 } : navLink
        }
      >
        Downloads
      </Link>
    </nav>
  );
}
