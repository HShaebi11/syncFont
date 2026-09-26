import { Landing } from "@/components/landing";
import type { EarlyAccessPlan } from "@/lib/account";

function configuredOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim().replace(/\/$/, "");
  return trimmed || null;
}

export default async function MarketingHomePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  const initialPlan: EarlyAccessPlan | null =
    params.plan === "pro" ? "pro" : params.plan === "free" ? "free" : null;

  return (
    <Landing
      apiBase={configuredOrigin(process.env.NEXT_PUBLIC_API_URL) ?? "http://127.0.0.1:43123"}
      appBase={configuredOrigin(process.env.NEXT_PUBLIC_APP_URL)}
      initialPlan={initialPlan}
      checkoutSuccess={params.checkout === "success"}
    />
  );
}
