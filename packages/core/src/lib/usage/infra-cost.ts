/**
 * Rough infra cost model (GBP) for founder dashboards.
 * Launch / Pro subscriptions are all-inclusive — customers are not charged pass-through infra fees.
 * Tune via INFRA_PLATFORM_FIXED_GBP_MONTHLY; variable rates match docs/PRODUCT.md order of magnitude.
 */

const BYTES_PER_GB = 1024 ** 3;

export function getPlatformFixedGbpPerMonth(): number {
  const raw = process.env.INFRA_PLATFORM_FIXED_GBP_MONTHLY?.trim();
  const parsed = raw ? Number(raw) : 35;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 35;
}

export type InfraCostBreakdown = {
  /** Hosting + sync baseline for plan tier (GBP for the period). */
  planBaselineGbp: number;
  /** Blob storage (GBP for the period). */
  storageGbp: number;
  /** Extra sync/API activity above baseline (GBP for the period). */
  syncActivityGbp: number;
  /** Share of Vercel/Neon fixed platform cost (GBP for the period). */
  platformFixedShareGbp: number;
  /** Sum of the above (GBP for the period). */
  totalGbp: number;
};

export function estimateUserInfraCostGbp(input: {
  plan: string;
  periodDays: number;
  storageUsedBytes: number;
  manifestFetchesInPeriod: number;
  uploadBytesInPeriod: number;
  platformFixedShareGbp: number;
}): InfraCostBreakdown {
  const months = input.periodDays / 30;
  const isPro = input.plan === "pro";
  const storageGb = input.storageUsedBytes / BYTES_PER_GB;

  // ~£0.02/mo free, ~£0.07–0.12/mo active Pro (PRODUCT.md); use mid Pro baseline.
  const planBaselinePerMonth = isPro ? 0.085 : 0.02;
  const planBaselineGbp = planBaselinePerMonth * months;

  // ~£0.02/GB-month blob + DB overhead (soft launch estimate).
  const storageGbp = storageGb * 0.02 * months;

  // Manifest polls: light marginal cost above plan baseline.
  const manifestPerMonth = (input.manifestFetchesInPeriod / input.periodDays) * 30;
  const syncActivityGbp = (manifestPerMonth / 10_000) * 0.5 * months;

  const uploadGb = input.uploadBytesInPeriod / BYTES_PER_GB;
  const uploadGbp = uploadGb * 0.01;

  const syncActivityTotal = syncActivityGbp + uploadGbp;

  const platformFixedShareGbp = input.platformFixedShareGbp;
  const totalGbp =
    planBaselineGbp + storageGbp + syncActivityTotal + platformFixedShareGbp;

  return {
    planBaselineGbp,
    storageGbp,
    syncActivityGbp: syncActivityTotal,
    platformFixedShareGbp,
    totalGbp,
  };
}

export const INFRA_PRICING_NOTE =
  "Subscription prices include cloud hosting and sync infrastructure. No separate infra fees.";
