import { WebhookFormat } from "@polar-sh/sdk/models/components/webhookformat.js";

import { getPolarClient } from "@typefolio/core/billing/polar";

const DEFAULT_URL = "https://app.typefolio.app/api/webhook/polar";
const ENDPOINT_NAME = "Typefolio app (production)";

const SUBSCRIPTION_EVENTS = [
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.canceled",
  "subscription.uncanceled",
  "subscription.revoked",
] as const;

function usage(): void {
  console.log(`Usage: polar-webhook.ts <command>

Commands:
  list     List webhook endpoints
  ensure   Create endpoint for production app URL if missing (idempotent by URL)
  reset-secret  Rotate secret for endpoint matching --url (prints new POLAR_WEBHOOK_SECRET)

Options:
  --url <https://...>   Default: ${DEFAULT_URL}

After ensure, add the printed secret to .env.local as POLAR_WEBHOOK_SECRET, then:
  npm run vercel:env:sync
`);
}

function requirePolar() {
  const polar = getPolarClient();
  if (!polar) {
    console.error("POLAR_ACCESS_TOKEN missing in .env.local");
    process.exit(1);
  }
  return polar;
}

async function listEndpoints() {
  const polar = requirePolar();
  const page = await polar.webhooks.listWebhookEndpoints({ limit: 50 });
  const items: Array<{ id: string; url: string; format: string; name?: string | null }> = [];
  for await (const chunk of page) {
    for (const endpoint of chunk.result?.items ?? []) {
      items.push({
        id: endpoint.id,
        url: endpoint.url,
        format: endpoint.format,
        name: endpoint.name,
      });
    }
  }
  if (items.length === 0) {
    console.log("No webhook endpoints.");
    return;
  }
  console.log(`Webhook endpoints (${items.length}):\n`);
  for (const item of items) {
    console.log(`  ${item.id}  ${item.format}  ${item.url}${item.name ? `  (${item.name})` : ""}`);
  }
}

async function findEndpointByUrl(targetUrl: string) {
  const polar = requirePolar();
  const page = await polar.webhooks.listWebhookEndpoints({ limit: 50 });
  for await (const chunk of page) {
    for (const endpoint of chunk.result?.items ?? []) {
      if (endpoint.url === targetUrl) {
        return endpoint;
      }
    }
  }
  return null;
}

async function resetSecret(targetUrl: string) {
  const polar = requirePolar();
  const existing = await findEndpointByUrl(targetUrl);
  if (!existing) {
    console.error(`No webhook for ${targetUrl}. Run: npm run polar:webhook -- ensure`);
    process.exit(1);
  }
  const updated = await polar.webhooks.resetWebhookEndpointSecret({ id: existing.id });
  console.log(`Rotated secret for ${updated.id} (${updated.url})\n`);
  console.log(`POLAR_WEBHOOK_SECRET=${updated.secret}`);
}

async function ensureEndpoint(targetUrl: string) {
  const existing = await findEndpointByUrl(targetUrl);
  if (existing) {
    console.log(`Webhook already exists: ${existing.id}`);
    console.log(`URL: ${existing.url}`);
    console.log("\nTo print a new signing secret: npm run polar:webhook -- reset-secret");
    return;
  }

  const polar = requirePolar();

  const created = await polar.webhooks.createWebhookEndpoint({
    url: targetUrl,
    name: ENDPOINT_NAME,
    format: WebhookFormat.Raw,
    events: [...SUBSCRIPTION_EVENTS],
  });

  console.log(`Created webhook endpoint: ${created.id}`);
  console.log(`URL: ${created.url}`);
  console.log("\nAdd to .env.local (and Vercel typefolio-app production):\n");
  console.log(`POLAR_WEBHOOK_SECRET=${created.secret}`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  if (!command || command === "help" || command === "-h") {
    usage();
    return;
  }

  const urlFlag = args.indexOf("--url");
  const targetUrl =
    urlFlag >= 0 && args[urlFlag + 1] ? args[urlFlag + 1] : DEFAULT_URL;

  switch (command) {
    case "list":
      await listEndpoints();
      break;
    case "ensure":
      await ensureEndpoint(targetUrl);
      break;
    case "reset-secret":
      await resetSecret(targetUrl);
      break;
    default:
      usage();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
