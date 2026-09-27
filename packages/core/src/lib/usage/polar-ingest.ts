/**
 * Forward usage events to Polar so dashboard **Meters** can aggregate per customer.
 * Tracking/analytics only — subscriptions stay flat (Launch/Pro); never attach these
 * meters to Polar products or usage-based prices.
 */
import { getPolarClient } from "@typefolio/core/billing/polar";
import type { UsageMetric } from "@typefolio/core/usage/events";

function polarUsageEnabled(): boolean {
  const value = process.env.POLAR_USAGE_EVENTS?.trim().toLowerCase();
  return value !== "false" && value !== "0";
}

export function ingestPolarUsageEvent(input: {
  userId: string;
  name: UsageMetric;
  amount?: number;
  metadata?: Record<string, string | number | boolean>;
}): void {
  if (!polarUsageEnabled()) {
    return;
  }

  const polar = getPolarClient();
  if (!polar) {
    return;
  }

  const metadata: Record<string, string | number | boolean> = {
    ...input.metadata,
  };
  if (input.amount != null && input.amount !== 1) {
    metadata.amount = input.amount;
  }

  void polar.events
    .ingest({
      events: [
        {
          name: input.name,
          externalCustomerId: input.userId,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        },
      ],
    })
    .catch((error) => {
      console.error("[usage] polar events.ingest failed", {
        name: input.name,
        userId: input.userId,
        error,
      });
    });
}
