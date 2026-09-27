/**
 * Pre-launch audit: local env + optional production health checks.
 * Usage: npm run launch:audit
 *        npm run launch:audit -- --prod
 */

const LAUNCH_KEYS = [
  "POLAR_ACCESS_TOKEN",
  "POLAR_WEBHOOK_SECRET",
  "POLAR_SERVER",
  "POLAR_PRODUCT_LAUNCH",
  "LAUNCH_OFFER_ACTIVE",
  "POLAR_USAGE_EVENTS",
  "ADMIN_USER_IDS",
] as const;

const VERCEL_APP_PRODUCTION_KEYS = [
  "POLAR_ACCESS_TOKEN",
  "POLAR_WEBHOOK_SECRET",
  "POLAR_PRODUCT_LAUNCH",
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BLOB_READ_WRITE_TOKEN",
] as const;

function checkLocal(): boolean {
  let ok = true;
  console.log("=== Local (.env.local) ===\n");
  for (const key of LAUNCH_KEYS) {
    const value = process.env[key]?.trim();
    if (!value) {
      console.log(`  ✗ ${key}`);
      ok = false;
    } else if (key === "POLAR_ACCESS_TOKEN" || key === "POLAR_WEBHOOK_SECRET") {
      console.log(`  ✓ ${key} (set)`);
    } else {
      console.log(`  ✓ ${key}=${value}`);
    }
  }
  if (process.env.POLAR_SERVER?.trim() !== "production") {
    console.log(
      `  ⚠ POLAR_SERVER=${process.env.POLAR_SERVER ?? "(unset)"} — use production for live sales`,
    );
  }
  return ok;
}

async function checkProdApi(): Promise<void> {
  const app = "https://app.typefolio.app";
  console.log(`\n=== Production API (${app}) ===\n`);

  const plansUrl = `${app}/api/billing/plans`;
  try {
    const res = await fetch(plansUrl, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      console.log(`  ✗ GET /api/billing/plans → ${res.status}`);
      return;
    }
    const body = (await res.json()) as {
      launchOffer?: { active?: boolean };
      plans?: Array<{ id: string; name: string }>;
    };
    const planNames = (body.plans ?? []).map((p) => p.name).join(", ");
    console.log(`  ✓ GET /api/billing/plans → ${res.status} (${planNames})`);
    console.log(`    launchOffer.active=${String(body.launchOffer?.active)}`);
  } catch (error) {
    console.log(`  ✗ GET /api/billing/plans failed: ${error instanceof Error ? error.message : error}`);
  }

  console.log("\n=== Vercel (typefolio-app production) — verify in dashboard ===\n");
  for (const key of VERCEL_APP_PRODUCTION_KEYS) {
    console.log(`  [ ] ${key}`);
  }
  console.log(
    "\n  Tip: after local env is complete, run npm run vercel:env:sync and redeploy typefolio-app.",
  );
}

async function main() {
  const prod = process.argv.includes("--prod");
  const localOk = checkLocal();
  if (prod) {
    await checkProdApi();
  } else {
    console.log("\nRun with --prod to hit app.typefolio.app billing/plans.");
  }
  process.exit(localOk ? 0 : 1);
}

main();
