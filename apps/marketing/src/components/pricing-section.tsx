import type { CSSProperties } from "react";

import { getPublicBillingPlans } from "@typefolio/core/billing/plans";
import { getLaunchTrialDays } from "@typefolio/core/billing/polar-trial";
import { formatGbp, formatGbpPerYearShort } from "@typefolio/core/billing/prices";

import { apiUrl } from "@/lib/site";
import { primaryLink } from "@/lib/styles";

const card: CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: "0.75rem",
  padding: "1.5rem",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  flex: "1 1 14rem",
  minWidth: "14rem",
};

export function PricingSection() {
  const { plans, launchOffer } = getPublicBillingPlans();
  const trialDays = getLaunchTrialDays();
  const launchPlan = plans.find((p) => p.id === "pro_launch");

  return (
    <section id="pricing" aria-labelledby="pricing-heading">
      <header style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <h2
          id="pricing-heading"
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Pricing
        </h2>
        {launchOffer.active ? (
          <p style={{ margin: 0, fontSize: "0.9375rem", color: "#525252", maxWidth: "36rem" }}>
            {launchOffer.message}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: "0.9375rem", color: "#525252", maxWidth: "36rem" }}>
            Subscription includes cloud hosting, sync, and install on your devices.
          </p>
        )}
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "stretch" }}>
        {plans.map((plan) => {
          const highlighted = plan.highlight;
          const priceLabel =
            plan.interval === "month"
              ? `${formatGbp(plan.priceGbp)}/mo`
              : formatGbpPerYearShort(plan.priceGbp);

          const ctaLabel =
            plan.id === "pro_launch"
              ? "Start trial"
              : plan.interval === "month"
                ? "Subscribe monthly"
                : "Subscribe yearly";

          return (
            <article
              key={plan.id}
              style={{
                ...card,
                borderColor: highlighted ? "#000" : "#e5e5e5",
                boxShadow: highlighted ? "0 0 0 1px #000" : undefined,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 500, color: "#737373" }}>
                    {plan.name}
                  </p>
                  {plan.badge ? (
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "0.25rem",
                        background: "#000",
                        color: "#fff",
                      }}
                    >
                      {plan.badge}
                    </span>
                  ) : null}
                </div>
                <p style={{ margin: "0.35rem 0 0", fontSize: "1.75rem", fontWeight: 600 }}>{priceLabel}</p>
                {plan.id === "pro_launch" ? (
                  <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "#737373" }}>
                    {trialDays}-day trial on Polar, then billed yearly
                  </p>
                ) : null}
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.1rem",
                  fontSize: "0.875rem",
                  color: "#525252",
                  lineHeight: 1.55,
                }}
              >
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a href={apiUrl("/auth/sign-up")} style={{ ...primaryLink, marginTop: "auto" }}>
                {ctaLabel}
              </a>
            </article>
          );
        })}
      </div>

      <p style={{ margin: "1.25rem 0 0", fontSize: "0.8125rem", color: "#737373", lineHeight: 1.5 }}>
        {launchPlan
          ? `New accounts complete Launch checkout in the web app (Settings) after email verification. Launch price stays locked while you remain subscribed.`
          : `New accounts choose a plan in the web app after email verification. Checkout is handled by Polar.`}
      </p>
    </section>
  );
}
