import type { Metadata } from "next";
import Link from "next/link";

import { SiteNav } from "@/components/site-nav";

import { apiUrl } from "@/lib/site";
import { pageShell, primaryLink, secondaryLink } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Pricing — Typefolio",
  description:
    "Free web library or Launch — £20/year all-inclusive hosting and sync for your personal font collection.",
};

export const revalidate = 60;

type BillingPlanPublic = {
  id: string;
  name: string;
  priceGbp: number;
  interval: "year" | "month" | null;
  storageLimitBytes: number;
  deviceLimit: number;
  features: string[];
  highlight: boolean;
  badge?: string;
  available?: boolean;
};

function formatStorage(bytes: number): string {
  const mb = Math.round(bytes / (1024 * 1024));
  return `${mb} MB`;
}

function formatPrice(plan: BillingPlanPublic): string {
  if (plan.priceGbp === 0) {
    return "Free";
  }
  const interval = plan.interval === "month" ? "/mo" : "/yr";
  return `£${plan.priceGbp}${interval}`;
}

async function fetchBillingPlans(): Promise<{
  plans: BillingPlanPublic[];
  launchOffer: { active: boolean; message: string };
}> {
  const response = await fetch(apiUrl("/api/billing/plans"), {
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    return {
      plans: [],
      launchOffer: { active: false, message: "" },
    };
  }
  return (await response.json()) as {
    plans: BillingPlanPublic[];
    launchOffer: { active: boolean; message: string };
  };
}

export default async function PricingPage() {
  const { plans, launchOffer } = await fetchBillingPlans();
  const checkoutCta = apiUrl("/auth/sign-up");

  return (
    <div style={pageShell}>
      <SiteNav active="pricing" />

      <header style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Pricing
        </h1>
        <p style={{ margin: 0, fontSize: "1.0625rem", color: "#525252", maxWidth: "36rem" }}>
          Personal cloud storage for your typefaces. Subscribe on the web; desktop and native apps
          sync with the same account.
        </p>
        {launchOffer.active && launchOffer.message ? (
          <p
            style={{
              margin: 0,
              fontSize: "0.9375rem",
              color: "#171717",
              padding: "0.75rem 1rem",
              background: "#f5f5f5",
              borderRadius: "0.5rem",
              maxWidth: "36rem",
            }}
          >
            {launchOffer.message}
          </p>
        ) : null}
      </header>

      {plans.length === 0 ? (
        <p style={{ margin: 0, color: "#737373", fontSize: "0.875rem" }}>
          Plans are loading from the product app — check{" "}
          <a href={apiUrl("/")} style={{ color: "#171717" }}>app.typefolio.app</a> if this persists.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
          }}
        >
          {plans.map((plan) => {
            const isLaunch = plan.id === "pro_launch";
            const ctaLabel =
              plan.id === "free"
                ? "Create free account"
                : isLaunch
                  ? "Get Launch"
                  : "Sign up for Pro";
            const showCta = plan.id === "free" || plan.available !== false;

            return (
              <article
                key={plan.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  padding: "1.25rem",
                  borderRadius: "0.75rem",
                  border: plan.highlight ? "2px solid #171717" : "1px solid #e5e5e5",
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>{plan.name}</h2>
                    {plan.badge ? (
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "0.25rem",
                          background: "#171717",
                          color: "#fff",
                        }}
                      >
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>
                  <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>{formatPrice(plan)}</p>
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "#737373" }}>
                    {formatStorage(plan.storageLimitBytes)} · {plan.deviceLimit} device
                    {plan.deviceLimit === 1 ? "" : "s"}
                  </p>
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.125rem",
                    fontSize: "0.875rem",
                    color: "#525252",
                    flex: 1,
                  }}
                >
                  {plan.features.map((feature) => (
                    <li key={feature} style={{ marginBottom: "0.35rem" }}>{feature}</li>
                  ))}
                </ul>
                {showCta ? (
                  <a
                    href={checkoutCta}
                    style={plan.highlight ? primaryLink : secondaryLink}
                  >
                    {ctaLabel}
                  </a>
                ) : (
                  <span style={{ fontSize: "0.875rem", color: "#737373" }}>Not available</span>
                )}
              </article>
            );
          })}
        </div>
      )}

      <p style={{ margin: 0, fontSize: "0.875rem", color: "#737373", maxWidth: "36rem" }}>
        Already have an account?{" "}
        <a href={apiUrl("/auth/sign-in")} style={{ color: "#171717" }}>Sign in</a> and upgrade from{" "}
        <strong style={{ fontWeight: 500 }}>Settings → Account</strong>. Launch pricing is grandfathered
        while you stay subscribed.
      </p>

      <p style={{ margin: 0, fontSize: "0.875rem", color: "#737373" }}>
        <Link href="/downloads" style={{ color: "#171717" }}>Download the desktop app</Link> after you
        subscribe to sync fonts automatically.
      </p>
    </div>
  );
}
