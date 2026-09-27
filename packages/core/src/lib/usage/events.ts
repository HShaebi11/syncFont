/**
 * Polar event names for **usage tracking** (meters + admin rollups).
 * Must match filters in `npm run polar:meters -- ensure`. Not used for billing.
 */
export const USAGE_EVENT = {
  syncManifest: "typefolio.sync.manifest",
  fontUpload: "typefolio.font.upload",
  deviceSync: "typefolio.device.sync",
  deviceRegister: "typefolio.device.register",
} as const;

export type UsageMetric = (typeof USAGE_EVENT)[keyof typeof USAGE_EVENT];
