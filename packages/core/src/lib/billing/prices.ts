/** Public GBP subscription amounts (must match Polar catalog). */
export const LAUNCH_PRICE_GBP = 14.99;
export const LAUNCH_PRICE_GBP_MINOR = 1499;

export const PRO_ANNUAL_PRICE_GBP = 40;
export const PRO_ANNUAL_PRICE_GBP_MINOR = 4000;

export const PRO_MONTHLY_PRICE_GBP = 4.99;
export const PRO_MONTHLY_PRICE_GBP_MINOR = 499;

export function formatGbp(amount: number): string {
  return Number.isInteger(amount) ? `£${amount}` : `£${amount.toFixed(2)}`;
}

export function formatGbpPerYear(amount: number): string {
  return `${formatGbp(amount)}/year`;
}

export function formatGbpPerYearShort(amount: number): string {
  return `${formatGbp(amount)}/yr`;
}
