import { sql } from "drizzle-orm";

import { getDb } from "@typefolio/core/db";
import { usageHourly } from "@typefolio/core/db/schema";
import type { UsageMetric } from "@typefolio/core/usage/events";
import { ingestPolarUsageEvent } from "@typefolio/core/usage/polar-ingest";

export function currentUsageHourBucket(date = new Date()): string {
  const bucket = new Date(date);
  bucket.setUTCMinutes(0, 0, 0);
  return bucket.toISOString();
}

/**
 * Record product usage for a user (hourly rollup in DB + optional Polar meter ingest).
 * Does not affect invoices — flat subscription pricing only.
 * Fire-and-forget — does not throw to callers.
 */
export function recordUsage(
  userId: string,
  metric: UsageMetric,
  options?: { count?: number; sumValue?: number; metadata?: Record<string, string | number | boolean> },
): void {
  const count = options?.count ?? 1;
  const sumValue = options?.sumValue ?? 0;
  const bucketHour = currentUsageHourBucket();

  void (async () => {
    const db = getDb();
    await db
      .insert(usageHourly)
      .values({
        userId,
        bucketHour,
        metric,
        count,
        sumValue,
      })
      .onConflictDoUpdate({
        target: [usageHourly.userId, usageHourly.bucketHour, usageHourly.metric],
        set: {
          count: sql`${usageHourly.count} + ${count}`,
          sumValue: sql`${usageHourly.sumValue} + ${sumValue}`,
        },
      });
  })().catch((error) => {
    console.error("[usage] recordUsage db failed", { userId, metric, error });
  });

  ingestPolarUsageEvent({
    userId,
    name: metric,
    amount: count,
    metadata: options?.metadata,
  });
}
