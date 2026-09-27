import { TrialInterval } from "@polar-sh/sdk/models/components/trialinterval.js";

const DEFAULT_LAUNCH_TRIAL_DAYS = 7;

export function getLaunchTrialDays(): number {
  const raw = process.env.LAUNCH_TRIAL_DAYS?.trim();
  if (!raw) {
    return DEFAULT_LAUNCH_TRIAL_DAYS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_LAUNCH_TRIAL_DAYS;
  }
  return parsed;
}

/** Trial configured on the Polar Launch product (checkout → `trialing` subscription). */
export function polarLaunchTrialSettings(): {
  trialInterval: typeof TrialInterval.Day;
  trialIntervalCount: number;
} {
  return {
    trialInterval: TrialInterval.Day,
    trialIntervalCount: getLaunchTrialDays(),
  };
}
