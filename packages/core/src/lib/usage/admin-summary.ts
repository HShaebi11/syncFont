import { eq, gte, sum } from "drizzle-orm";

import { getDb } from "@typefolio/core/db";
import { authUser } from "@typefolio/core/db/schema-auth";
import { subscriptions, usageHourly } from "@typefolio/core/db/schema";
import { getStorageUsedBytes, getDeviceCount } from "@typefolio/core/entitlements";
import { USAGE_EVENT } from "@typefolio/core/usage/events";
import {
  estimateUserInfraCostGbp,
  getPlatformFixedGbpPerMonth,
  INFRA_PRICING_NOTE,
  type InfraCostBreakdown,
} from "@typefolio/core/usage/infra-cost";

const METRICS = [
  USAGE_EVENT.syncManifest,
  USAGE_EVENT.fontUpload,
  USAGE_EVENT.deviceSync,
  USAGE_EVENT.deviceRegister,
] as const;

export async function getUsageAdminSummary(days = 7): Promise<{
  periodDays: number;
  pricingNote: string;
  infra: {
    platformFixedGbpPerMonth: number;
    estimatedPlatformFixedGbp: number;
    estimatedVariableGbp: number;
    estimatedTotalGbp: number;
  };
  totals: Record<string, { count: number; sumValue: number }>;
  users: Array<{
    userId: string;
    email: string | null;
    plan: string;
    storageUsedBytes: number;
    deviceCount: number;
    metrics: Record<string, { count: number; sumValue: number }>;
    infraCostGbp: InfraCostBreakdown;
  }>;
}> {
  const db = getDb();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const sinceIso = since.toISOString();

  const totalRows = await db
    .select({
      metric: usageHourly.metric,
      count: sum(usageHourly.count),
      sumValue: sum(usageHourly.sumValue),
    })
    .from(usageHourly)
    .where(gte(usageHourly.bucketHour, sinceIso))
    .groupBy(usageHourly.metric);

  const totals: Record<string, { count: number; sumValue: number }> = {};
  for (const metric of METRICS) {
    totals[metric] = { count: 0, sumValue: 0 };
  }
  for (const row of totalRows) {
    totals[row.metric] = {
      count: Number(row.count ?? 0),
      sumValue: Number(row.sumValue ?? 0),
    };
  }

  const perUserRows = await db
    .select({
      userId: usageHourly.userId,
      metric: usageHourly.metric,
      count: sum(usageHourly.count),
      sumValue: sum(usageHourly.sumValue),
    })
    .from(usageHourly)
    .where(gte(usageHourly.bucketHour, sinceIso))
    .groupBy(usageHourly.userId, usageHourly.metric);

  const activityByUser = new Map<string, number>();
  for (const row of perUserRows) {
    activityByUser.set(
      row.userId,
      (activityByUser.get(row.userId) ?? 0) + Number(row.count ?? 0),
    );
  }

  const userIds = [...activityByUser.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([userId]) => userId);
  const userMetrics = new Map<
    string,
    Record<string, { count: number; sumValue: number }>
  >();

  for (const userId of userIds) {
    const metrics: Record<string, { count: number; sumValue: number }> = {};
    for (const metric of METRICS) {
      metrics[metric] = { count: 0, sumValue: 0 };
    }
    userMetrics.set(userId, metrics);
  }

  for (const row of perUserRows) {
    const metrics = userMetrics.get(row.userId);
    if (metrics) {
      metrics[row.metric] = {
        count: Number(row.count ?? 0),
        sumValue: Number(row.sumValue ?? 0),
      };
    }
  }

  const platformFixedGbpPerMonth = getPlatformFixedGbpPerMonth();
  const estimatedPlatformFixedGbp = platformFixedGbpPerMonth * (days / 30);
  const usersForCost = Math.max(1, userIds.length);
  const fixedSharePerUser = estimatedPlatformFixedGbp / usersForCost;

  const users: Array<{
    userId: string;
    email: string | null;
    plan: string;
    storageUsedBytes: number;
    deviceCount: number;
    metrics: Record<string, { count: number; sumValue: number }>;
    infraCostGbp: InfraCostBreakdown;
  }> = [];

  let estimatedVariableGbp = 0;

  for (const userId of userIds.slice(0, 100)) {
    const [authRow] = await db
      .select({ email: authUser.email })
      .from(authUser)
      .where(eq(authUser.id, userId))
      .limit(1);

    const [subRow] = await db
      .select({ plan: subscriptions.plan })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    const [storageUsedBytes, deviceCount] = await Promise.all([
      getStorageUsedBytes(userId),
      getDeviceCount(userId),
    ]);

    const metrics = userMetrics.get(userId) ?? {};
    const infraCostGbp = estimateUserInfraCostGbp({
      plan: subRow?.plan ?? "free",
      periodDays: days,
      storageUsedBytes,
      manifestFetchesInPeriod: metrics[USAGE_EVENT.syncManifest]?.count ?? 0,
      uploadBytesInPeriod: metrics[USAGE_EVENT.fontUpload]?.sumValue ?? 0,
      platformFixedShareGbp: fixedSharePerUser,
    });

    estimatedVariableGbp +=
      infraCostGbp.totalGbp - infraCostGbp.platformFixedShareGbp;

    users.push({
      userId,
      email: authRow?.email ?? null,
      plan: subRow?.plan ?? "free",
      storageUsedBytes,
      deviceCount,
      metrics,
      infraCostGbp,
    });
  }

  const estimatedTotalGbp = estimatedPlatformFixedGbp + estimatedVariableGbp;

  return {
    periodDays: days,
    pricingNote: INFRA_PRICING_NOTE,
    infra: {
      platformFixedGbpPerMonth,
      estimatedPlatformFixedGbp,
      estimatedVariableGbp,
      estimatedTotalGbp,
    },
    totals,
    users,
  };
}
