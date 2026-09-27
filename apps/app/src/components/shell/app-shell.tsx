"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FolderIcon, HeartIcon, HomeIcon, RefreshCwIcon, SearchIcon } from "lucide-react";

import { UpgradeLaunchBanner } from "@/components/billing/upgrade-launch-banner";
import { LibraryProvider, useLibrary } from "@/components/library/library-provider";
import { SearchOverlay } from "@/components/search/search-overlay";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OfflineBanner } from "@/components/ui/feedback";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { relativeTime } from "@/lib/format";
import { marketingDownloadsUrl } from "@/lib/marketing";

const HEADER_LINKS = [
  { href: "/fonts", label: "Fonts", match: (pathname: string) => pathname === "/fonts" || pathname.startsWith("/fonts/") },
  { href: "/favorites", label: "Favorites", match: (pathname: string) => pathname.startsWith("/favorites") },
  { href: "/collections", label: "Collections", match: (pathname: string) => pathname.startsWith("/collections") },
  { href: "/devices", label: "Devices", match: (pathname: string) => pathname.startsWith("/devices") },
] as const;

function SyncStatus({ latestSync }: { latestSync?: string }) {
  const [label, setLabel] = useState("Sync");

  useEffect(() => {
    setLabel(latestSync ? `Synced ${relativeTime(latestSync)}` : "Sync");
  }, [latestSync]);

  return (
    <Link
      href="/devices"
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:inline-flex")}
    >
      <Badge variant="outline">{label}</Badge>
    </Link>
  );
}

function MobileNav({ onSearch }: { onSearch: () => void }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/fonts", label: "Fonts", icon: FolderIcon },
    { href: "/favorites", label: "Saved", icon: HeartIcon },
    { href: "/devices", label: "Sync", icon: RefreshCwIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t bg-background/95 px-2 py-2 backdrop-blur lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: active ? "secondary" : "ghost", size: "sm" }),
              "flex h-auto flex-col gap-1 px-3 py-1.5",
            )}
          >
            <Icon className="size-4" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        className="flex h-auto flex-col gap-1 px-3 py-1.5"
        onClick={onSearch}
      >
        <SearchIcon className="size-4" />
        <span className="text-[10px]">Search</span>
      </Button>
    </nav>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { offline, devices, refresh } = useLibrary();
  const latestSync = devices
    .map((device) => device.lastSyncAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") {
      return;
    }
    toast.success("Welcome to Typefolio Launch — sync is now enabled.");
    void refresh();
    router.replace(pathname);
  }, [searchParams, pathname, router, refresh]);

  useEffect(() => {
    let pendingG = false;
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if ((meta && event.key.toLowerCase() === "k") || (meta && event.key === "/")) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "g" && !meta) {
        pendingG = true;
        window.setTimeout(() => {
          pendingG = false;
        }, 600);
      } else if (pendingG) {
        const map: Record<string, string> = {
          f: "/fonts",
          c: "/collections",
          d: "/devices",
        };
        const href = map[event.key.toLowerCase()];
        if (href) router.push(href);
        pendingG = false;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Typefolio
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {HEADER_LINKS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-2.5 py-1 text-sm",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button
          variant="outline"
          className="hidden w-full max-w-sm justify-start text-muted-foreground md:inline-flex"
          onClick={() => setSearchOpen(true)}
        >
          <SearchIcon />
          Search fonts, collections...
          <kbd className="ml-auto text-xs">⌘K</kbd>
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <UpgradeLaunchBanner compact />
          <SyncStatus latestSync={latestSync} />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account">
                <Avatar className="size-7">
                  <AvatarFallback>TF</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  window.open(marketingDownloadsUrl(), "_blank", "noopener,noreferrer")
                }
              >
                Download desktop app
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/devices")}>
                Devices
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/auth/sign-in";
                      },
                    },
                  })
                }
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {offline ? <OfflineBanner /> : null}
      <div className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </div>
      <MobileNav onSearch={() => setSearchOpen(true)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toaster />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LibraryProvider>
      <TooltipProvider>
        <ShellInner>{children}</ShellInner>
      </TooltipProvider>
    </LibraryProvider>
  );
}
