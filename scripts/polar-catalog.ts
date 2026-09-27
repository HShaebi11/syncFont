import type { Product } from "@polar-sh/sdk/models/components/product.js";

import { resolvePolarProductId } from "@typefolio/core/billing/plans";
import { getPolarClient } from "@typefolio/core/billing/polar";
import {
  getLaunchTrialDays,
  polarLaunchTrialSettings,
} from "@typefolio/core/billing/polar-trial";
import {
  LAUNCH_PRICE_GBP_MINOR,
  PRO_ANNUAL_PRICE_GBP_MINOR,
  PRO_MONTHLY_PRICE_GBP_MINOR,
} from "@typefolio/core/billing/prices";

const PRODUCT_NAME_LAUNCH = "Typefolio Launch";
const PRODUCT_NAME_PRO = "Typefolio Pro";
const PRODUCT_NAME_PRO_MONTHLY = "Typefolio Pro — monthly";

/** Legacy Polar product names — archived when found during sync. */
const LEGACY_PRODUCT_NAMES = new Set([
  "Typefolio Pro Annual",
  "Typefolio Pro Monthly",
]);

type CatalogSpec = {
  envKey: "POLAR_PRODUCT_LAUNCH" | "POLAR_PRODUCT_ANNUAL" | "POLAR_PRODUCT_MONTHLY";
  name: string;
  recurringInterval: "year" | "month";
  priceAmountMinor: number;
};

function usage(): void {
  console.log(`Usage: polar-catalog.ts <command>

Commands:
  verify   Check POLAR_ACCESS_TOKEN (lists one product)
  list     List active products and env mapping
  ensure   Create missing catalog products (idempotent by name)
  sync     Update Launch price/trial; archive legacy catalog names

Options:
  --with-pro   Also ensure Pro annual (£40/yr) and monthly (£4.99/mo)
               Or set POLAR_ENSURE_PRO=true

Examples:
  npm run polar:catalog -- verify
  npm run polar:catalog -- list
  npm run polar:catalog -- ensure
  npm run polar:catalog -- ensure --with-pro
  npm run polar:catalog -- sync`);
}

function requirePolarClient() {
  const polar = getPolarClient();
  if (!polar) {
    console.error(
      "POLAR_ACCESS_TOKEN is missing. Add an organization access token to .env.local (see POLAR_SETUP.md).",
    );
    process.exit(1);
  }
  return polar;
}

async function listActiveProducts(): Promise<Product[]> {
  const polar = requirePolarClient();
  const page = await polar.products.list({ limit: 100 });
  const items: Product[] = [];
  for await (const chunk of page) {
    const batch = chunk.result?.items ?? [];
    for (const product of batch) {
      if (!product.isArchived) {
        items.push(product);
      }
    }
  }
  return items;
}

function formatProductLine(product: Product): string {
  const prices = product.prices ?? [];
  const priceParts = prices.map((p) => {
    const amount =
      "priceAmount" in p && typeof p.priceAmount === "number"
        ? p.priceAmount
        : null;
    const currency =
      "priceCurrency" in p && typeof p.priceCurrency === "string"
        ? p.priceCurrency.toUpperCase()
        : "";
    const interval =
      product.recurringInterval != null ? `/${product.recurringInterval}` : "";
    if (amount != null) {
      return `${currency} ${(amount / 100).toFixed(2)}${interval}`;
    }
    return "price";
  });
  return `${product.id}  ${product.name}  [${priceParts.join(", ") || "no prices"}]`;
}

function printEnvBlock(ids: Record<string, string | undefined>): void {
  console.log("\n# Paste into .env.local (product UUIDs only):\n");
  for (const [key, value] of Object.entries(ids)) {
    if (value) {
      console.log(`${key}=${value}`);
    }
  }
}

async function cmdVerify(): Promise<void> {
  try {
    const products = await listActiveProducts();
    const server = process.env.POLAR_SERVER?.trim() || "production";
    console.log(
      `Polar OK (${server}). Token can list products (${products.length} active in first pages).`,
    );
  } catch (error) {
    const server = process.env.POLAR_SERVER?.trim() || "production";
    console.error("Polar verify failed:", error instanceof Error ? error.message : error);
    console.error(
      `Check POLAR_ACCESS_TOKEN and POLAR_SERVER=${server} (token must be issued for that environment).`,
    );
    process.exit(1);
  }
}

async function cmdList(): Promise<void> {
  const products = await listActiveProducts();
  console.log(`Active products (${products.length}):\n`);
  for (const product of products) {
    console.log(formatProductLine(product));
  }

  console.log("\nEnv mapping (from .env.local):");
  const launch = resolvePolarProductId("pro_launch");
  const annual = resolvePolarProductId("pro_annual");
  const monthly = resolvePolarProductId("pro_monthly");
  console.log(`  POLAR_PRODUCT_LAUNCH=${launch ?? "(unset)"}`);
  console.log(`  POLAR_PRODUCT_ANNUAL=${annual ?? "(unset)"}`);
  console.log(`  POLAR_PRODUCT_MONTHLY=${monthly ?? "(unset)"}`);

  for (const product of products) {
    const tags: string[] = [];
    if (launch && product.id === launch) tags.push("matches POLAR_PRODUCT_LAUNCH");
    if (annual && product.id === annual) tags.push("matches POLAR_PRODUCT_ANNUAL");
    if (monthly && product.id === monthly) tags.push("matches POLAR_PRODUCT_MONTHLY");
    if (tags.length > 0) {
      console.log(`  → ${product.name}: ${tags.join(", ")}`);
    }
  }
}

function isFixedGbpPrice(
  price: NonNullable<Product["prices"]>[number],
): price is { id: string; amountType: "fixed"; priceAmount: number; priceCurrency: string; isArchived: boolean } {
  return (
    price.amountType === "fixed" &&
    "priceAmount" in price &&
    typeof price.priceAmount === "number" &&
    "priceCurrency" in price &&
    typeof price.priceCurrency === "string" &&
    "isArchived" in price &&
    typeof price.isArchived === "boolean" &&
    "id" in price &&
    typeof price.id === "string"
  );
}

async function archiveLegacyProducts(existing: Product[]): Promise<void> {
  const polar = requirePolarClient();
  for (const product of existing) {
    if (!LEGACY_PRODUCT_NAMES.has(product.name)) {
      continue;
    }
    if (product.isArchived || !product.id) {
      continue;
    }
    console.log(`Archiving legacy product: ${product.name} (${product.id})`);
    await polar.products.update({
      id: product.id,
      productUpdate: { isArchived: true },
    });
  }
}

async function syncLaunchProductPrice(productId: string): Promise<void> {
  const polar = requirePolarClient();
  const product = await polar.products.get({ id: productId });
  const prices = product.prices ?? [];
  const activeFixed = prices.filter(isFixedGbpPrice).filter(
    (p) => !p.isArchived && p.priceCurrency.toLowerCase() === "gbp",
  );

  const hasTarget = activeFixed.some((p) => p.priceAmount === LAUNCH_PRICE_GBP_MINOR);
  if (hasTarget) {
    console.log(
      `Launch price already GBP ${(LAUNCH_PRICE_GBP_MINOR / 100).toFixed(2)}/year on ${productId}`,
    );
    return;
  }

  console.log(
    `Setting Launch price to GBP ${(LAUNCH_PRICE_GBP_MINOR / 100).toFixed(2)}/year (Polar allows one fixed price per product; existing subscriptions keep their locked amount).`,
  );
  await polar.products.update({
    id: productId,
    productUpdate: {
      name: PRODUCT_NAME_LAUNCH,
      prices: [
        {
          amountType: "fixed",
          priceAmount: LAUNCH_PRICE_GBP_MINOR,
          priceCurrency: "gbp",
        },
      ],
    },
  });
}

async function syncLaunchProductTrial(productId: string): Promise<void> {
  const polar = requirePolarClient();
  const trial = polarLaunchTrialSettings();
  await polar.products.update({
    id: productId,
    productUpdate: {
      trialInterval: trial.trialInterval,
      trialIntervalCount: trial.trialIntervalCount,
    },
  });
  console.log(
    `Launch trial: ${trial.trialIntervalCount} ${trial.trialInterval}(s) (LAUNCH_TRIAL_DAYS=${getLaunchTrialDays()})`,
  );
}

async function ensureProduct(
  existing: Product[],
  spec: CatalogSpec,
  options?: { polarTrial?: boolean },
): Promise<string> {
  const polar = requirePolarClient();
  const trial = options?.polarTrial ? polarLaunchTrialSettings() : null;
  const found = existing.find((p) => p.name === spec.name);
  if (found?.id) {
    console.log(`Exists: ${spec.name} (${found.id})`);
    if (options?.polarTrial) {
      await syncLaunchProductTrial(found.id);
    }
    return found.id;
  }

  console.log(`Creating: ${spec.name}...`);
  const created = await polar.products.create({
    name: spec.name,
    recurringInterval: spec.recurringInterval,
    ...(trial
      ? {
          trialInterval: trial.trialInterval,
          trialIntervalCount: trial.trialIntervalCount,
        }
      : {}),
    prices: [
      {
        amountType: "fixed",
        priceAmount: spec.priceAmountMinor,
        priceCurrency: "gbp",
      },
    ],
  });
  console.log(`Created: ${spec.name} (${created.id})`);
  if (options?.polarTrial) {
    await syncLaunchProductTrial(created.id);
  }
  return created.id;
}

async function cmdEnsure(withPro: boolean): Promise<void> {
  const existing = await listActiveProducts();

  const specs: CatalogSpec[] = [
    {
      envKey: "POLAR_PRODUCT_LAUNCH",
      name: PRODUCT_NAME_LAUNCH,
      recurringInterval: "year",
      priceAmountMinor: LAUNCH_PRICE_GBP_MINOR,
    },
  ];

  if (withPro) {
    specs.push(
      {
        envKey: "POLAR_PRODUCT_ANNUAL",
        name: PRODUCT_NAME_PRO,
        recurringInterval: "year",
        priceAmountMinor: PRO_ANNUAL_PRICE_GBP_MINOR,
      },
      {
        envKey: "POLAR_PRODUCT_MONTHLY",
        name: PRODUCT_NAME_PRO_MONTHLY,
        recurringInterval: "month",
        priceAmountMinor: PRO_MONTHLY_PRICE_GBP_MINOR,
      },
    );
  }

  const ids: Record<string, string> = {};
  for (const spec of specs) {
    ids[spec.envKey] = await ensureProduct(existing, spec, {
      polarTrial: spec.envKey === "POLAR_PRODUCT_LAUNCH",
    });
  }

  printEnvBlock(ids);

  if (!withPro) {
    console.log(
      "\nPro products skipped. Run with --with-pro when Pro pricing is ready.",
    );
  }
}

async function cmdSync(): Promise<void> {
  const existing = await listActiveProducts();
  await archiveLegacyProducts(existing);

  const launchId = resolvePolarProductId("pro_launch");
  if (!launchId) {
    console.error("POLAR_PRODUCT_LAUNCH is unset. Run ensure first or set env.");
    process.exit(1);
  }

  await syncLaunchProductPrice(launchId);
  await syncLaunchProductTrial(launchId);
  console.log("\nLaunch catalog sync complete.");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args.find((a) => !a.startsWith("-"));
  const withPro =
    args.includes("--with-pro") ||
    process.env.POLAR_ENSURE_PRO?.trim().toLowerCase() === "true";

  if (!command || command === "help" || args.includes("--help")) {
    usage();
    process.exit(command ? 0 : 1);
  }

  switch (command) {
    case "verify":
      await cmdVerify();
      break;
    case "list":
      await cmdList();
      break;
    case "ensure":
      await cmdEnsure(withPro);
      break;
    case "sync":
      await cmdSync();
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      usage();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
