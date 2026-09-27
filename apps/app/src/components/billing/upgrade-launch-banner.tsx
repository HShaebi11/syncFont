"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { startBillingCheckout } from "@typefolio/core/api";

import { Button } from "@/components/ui/button";
import { useLibrary } from "@/components/library/library-provider";

export function UpgradeLaunchBanner({ compact = false }: { compact?: boolean }) {
  const { entitlement } = useLibrary();
  const [loading, setLoading] = useState(false);

  if (!entitlement || entitlement.plan !== "free" || entitlement.features.sync) {
    return null;
  }

  const onUpgrade = async () => {
    setLoading(true);
    try {
      const result = await startBillingCheckout("pro_launch");
      window.location.href = result.checkoutUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout unavailable.");
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <Button size="sm" disabled={loading} onClick={() => void onUpgrade()}>
        {loading ? "…" : "Launch £20/yr"}
      </Button>
    );
  }

  return (
    <div
      className="mb-6 flex flex-col gap-3 rounded-lg border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div className="text-sm">
        <p className="font-medium">Unlock auto-sync on desktop and iPad</p>
        <p className="text-muted-foreground">
          Typefolio Launch — £20/year, all-inclusive hosting & sync. Locked in while you stay
          subscribed.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button disabled={loading} onClick={() => void onUpgrade()}>
          {loading ? "Redirecting…" : "Upgrade to Launch"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/settings">Settings</Link>
        </Button>
      </div>
    </div>
  );
}
