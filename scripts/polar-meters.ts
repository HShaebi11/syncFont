import type { Filter } from "@polar-sh/sdk/models/components/filter.js";
import type { Meter } from "@polar-sh/sdk/models/components/meter.js";

import { getPolarClient } from "@typefolio/core/billing/polar";
import { USAGE_EVENT } from "@typefolio/core/usage/events";

type MeterSpec = {
  name: string;
  eventName: string;
  unit: "scalar" | "custom";
  customLabel?: string;
};

const METER_SPECS: MeterSpec[] = [
  {
    name: "Typefolio — Sync manifest fetches",
    eventName: USAGE_EVENT.syncManifest,
    unit: "scalar",
  },
  {
    name: "Typefolio — Font uploads",
    eventName: USAGE_EVENT.fontUpload,
    unit: "scalar",
  },
  {
    name: "Typefolio — Device syncs",
    eventName: USAGE_EVENT.deviceSync,
    unit: "scalar",
  },
  {
    name: "Typefolio — Device registrations",
    eventName: USAGE_EVENT.deviceRegister,
    unit: "scalar",
  },
];

function eventFilter(eventName: string): Filter {
  return {
    conjunction: "and",
    clauses: [{ property: "name", operator: "eq", value: eventName }],
  };
}

async function listMeters(): Promise<Meter[]> {
  const polar = getPolarClient();
  if (!polar) {
    console.error("POLAR_ACCESS_TOKEN missing in .env.local");
    process.exit(1);
  }

  const page = await polar.meters.list({ limit: 100 });
  const items: Meter[] = [];
  for await (const chunk of page) {
    items.push(...(chunk.result?.items ?? []));
  }
  return items;
}

async function cmdList(): Promise<void> {
  const meters = await listMeters();
  console.log(`Meters (${meters.length}):\n`);
  for (const meter of meters) {
    console.log(`${meter.id}  ${meter.name}`);
  }
}

async function cmdEnsure(): Promise<void> {
  const polar = getPolarClient();
  if (!polar) {
    process.exit(1);
  }

  const existing = await listMeters();

  for (const spec of METER_SPECS) {
    const found = existing.find((m) => m.name === spec.name);
    if (found?.id) {
      console.log(`Exists: ${spec.name} (${found.id})`);
      continue;
    }

    console.log(`Creating: ${spec.name}...`);
    const created = await polar.meters.create({
      name: spec.name,
      unit: spec.unit,
      customLabel: spec.customLabel,
      filter: eventFilter(spec.eventName),
      aggregation: { func: "count" },
    });
    console.log(`Created: ${spec.name} (${created.id})`);
  }

  console.log(
    "\nTracking only: do not attach these meters to product prices in Polar.",
  );
  console.log(
    "View usage in Polar → Meters after events ingest (POLAR_USAGE_EVENTS=true).",
  );
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command === "list") {
    await cmdList();
    return;
  }
  if (command === "ensure") {
    await cmdEnsure();
    return;
  }

  console.log(`Usage: polar-meters.ts <list|ensure>`);
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
