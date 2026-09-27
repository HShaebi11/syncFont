const required = [
  "DATABASE_URL",
  "BLOB_READ_WRITE_TOKEN",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_MARKETING_URL",
] as const;

const recommended = [
  "RESEND_API_KEY",
  "POLAR_ACCESS_TOKEN",
  "POLAR_WEBHOOK_SECRET",
  "POLAR_PRODUCT_LAUNCH",
  "POLAR_SERVER",
  "LAUNCH_OFFER_ACTIVE",
] as const;

const launchOptional = ["POLAR_PRODUCT_ANNUAL", "ADMIN_USER_IDS"] as const;

let failed = false;

for (const key of required) {
  const value = process.env[key]?.trim();
  if (!value) {
    console.error(`Missing required env: ${key}`);
    failed = true;
  }
}

for (const key of recommended) {
  const value = process.env[key]?.trim();
  if (!value) {
    console.warn(`Missing recommended env (feature degraded): ${key}`);
  }
}

for (const key of launchOptional) {
  const value = process.env[key]?.trim();
  if (!value) {
    console.warn(`Optional for launch: ${key}`);
  }
}

if (failed) {
  console.error(
    "\nCopy .env.example → .env.local and set values. Generate BETTER_AUTH_SECRET with: openssl rand -base64 32",
  );
  process.exit(1);
}

const polarToken = process.env.POLAR_ACCESS_TOKEN?.trim();
if (polarToken) {
  console.log(
    "Polar token present. Verify API access: npm run polar:catalog -- verify",
  );
}

console.log("Environment OK for Typefolio backend.");
