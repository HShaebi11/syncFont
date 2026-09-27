import Link from "next/link";

import { navLink, navLinkActive, siteNav } from "@/lib/styles";

type NavKey = "home" | "downloads" | "pricing";

export function SiteNav({ active }: { active: NavKey }) {
  const linkStyle = (key: NavKey) => (active === key ? navLinkActive : navLink);

  return (
    <nav style={siteNav} aria-label="Site">
      <Link href="/" style={linkStyle("home")}>
        Home
      </Link>
      <Link href="/pricing" style={linkStyle("pricing")}>
        Pricing
      </Link>
      <Link href="/downloads" style={linkStyle("downloads")}>
        Downloads
      </Link>
    </nav>
  );
}
