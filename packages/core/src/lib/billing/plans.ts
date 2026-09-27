import {
  isLaunchOfferActive,
  PRO_DEVICE_LIMIT,
  PRO_STORAGE_LIMIT_BYTES,
} from "@typefolio/core/entitlements";
import { getLaunchTrialDays } from "@typefolio/core/billing/polar-trial";
import type { CheckoutPriceId } from "@typefolio/core/types";

export function resolvePolarProductId(priceId: CheckoutPriceId): string | null {
  const envMap: Record<CheckoutPriceId, string | undefined> = {
    pro_annual: process.env.POLAR_PRODUCT_ANNUAL,
    pro_launch: process.env.POLAR_PRODUCT_LAUNCH,
    pro_monthly: process.env.POLAR_PRODUCT_MONTHLY,
  };

  const value = envMap[priceId]?.trim().replace(/^['"]|['"]$/g, "");
  return value || null;
}

export function isCheckoutPriceId(value: unknown): value is CheckoutPriceId {
  return (
    value === "pro_annual" || value === "pro_launch" || value === "pro_monthly"
  );
}

export function getPublicBillingPlans(): {
  plans: Array<{
    id: CheckoutPriceId;
    name: string;
    priceGbp: number;
    interval: "year" | "month" | null;
    storageLimitBytes: number;
    deviceLimit: number;
    features: string[];
    highlight: boolean;
    checkoutPriceId?: CheckoutPriceId;
    badge?: string;
    available?: boolean;
  }>;
  launchOffer: { active: boolean; message: string };
} {
  const launchActive = isLaunchOfferActive();
  const trialDays = getLaunchTrialDays();

  const launchPlan = {
    id: "pro_launch" as const,
    name: "Launch",
    priceGbp: 20,
    interval: "year" as const,
    storageLimitBytes: PRO_STORAGE_LIMIT_BYTES,
    deviceLimit: PRO_DEVICE_LIMIT,
    features: [
      `${trialDays}-day free trial (Polar)`,
      "Then £20/year — hosting & sync included",
      "500 MB storage",
      "2 devices, auto-sync",
      "Locked in while you stay subscribed",
    ],
    highlight: true,
    badge: "Launch",
    checkoutPriceId: "pro_launch" as const,
    available: launchActive,
  };

  if (launchActive) {
    return {
      plans: [launchPlan],
      launchOffer: {
        active: true,
        message:
          `Start with a ${trialDays}-day free trial on Launch, then £20/year all-inclusive. Billing is handled by Polar.`,
      },
    };
  }

  return {
    plans: [
      {
        id: "pro_annual",
        name: "Pro",
        priceGbp: 40,
        interval: "year",
        storageLimitBytes: PRO_STORAGE_LIMIT_BYTES,
        deviceLimit: PRO_DEVICE_LIMIT,
        features: ["500 MB storage", "2 devices", "Auto-sync"],
        highlight: true,
        checkoutPriceId: "pro_annual",
      },
      {
        id: "pro_monthly",
        name: "Pro Monthly",
        priceGbp: 4.99,
        interval: "month",
        storageLimitBytes: PRO_STORAGE_LIMIT_BYTES,
        deviceLimit: PRO_DEVICE_LIMIT,
        features: ["Same as Pro", "Pay monthly"],
        highlight: false,
        checkoutPriceId: "pro_monthly",
      },
    ],
    launchOffer: {
      active: false,
      message: "",
    },
  };
}
