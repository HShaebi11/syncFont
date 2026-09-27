"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { openBillingPortal, startBillingCheckout } from "@typefolio/core/api";

import { Button } from "@/components/ui/button";
import { useLibrary } from "@/components/library/library-provider";
import { relativeTime } from "@/lib/format";

export function UpgradeLaunchBanner({ compact = false }: { compact?: boolean }) {
  const { entitlement } = useLibrary();
  const [loading, setLoading] = useState(false);

  if (!entitlement || entitlement.isPaidSubscriber) {
    return null;
  }

  const onPolarTrial =
    entitlement.status === "trialing" && Boolean(entitlement.trialEndsAt);

  const onUpgrade = async () => {
    setLoading(true);
    try {
      if (onPolarTrial) {
        const result = await openBillingPortal();
        window.location.href = result.portalUrl;
        return;
      }
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
        {loading ? "…" : onPolarTrial ? "Launch £20/yr" : "Start free trial"}
      </Button>
    );
  }

  return (
    <div
      className="mb-6 flex flex-col gap-3 rounded-lg border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div className="text-sm">
        <p className="font-medium">
          {onPolarTrial
            ? "Polar trial active"
            : "Start your free trial on Launch"}
        </p>
        <p className="text-muted-foreground">
          {onPolarTrial
            ? `Full access until ${relativeTime(entitlement.trialEndsAt)}, then £20/year via Polar.`
            : "7-day free trial through Polar checkout, then £20/year all-inclusive (hosting & sync)."}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button disabled={loading} onClick={() => void onUpgrade()}>
          {loading ? "Redirecting…" : onPolarTrial ? "Manage in Polar" : "Start free trial"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/settings">Settings</Link>
        </Button>
      </div>
    </div>
  );
}
