import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { getPublicBillingPlans } from "@typefolio/core/billing/plans";
import { validateCheckoutPriceId } from "@typefolio/core/billing/polar";

const envSnapshot = { ...process.env };

afterEach(() => {
  process.env = { ...envSnapshot };
});

describe("getPublicBillingPlans", () => {
  it("returns only Free and Launch while launch offer is active", () => {
    process.env.LAUNCH_OFFER_ACTIVE = "true";
    process.env.POLAR_PRODUCT_LAUNCH = "694b0abe-c4af-4aa8-b67e-794392135307";

    const { plans, launchOffer } = getPublicBillingPlans();

    assert.equal(launchOffer.active, true);
    assert.deepEqual(plans.map((p) => p.id), ["free", "pro_launch"]);
    assert.equal(plans[1]?.name, "Launch");
    assert.equal(plans[1]?.checkoutPriceId, "pro_launch");
  });

  it("returns Pro tiers when launch offer is closed", () => {
    process.env.LAUNCH_OFFER_ACTIVE = "false";
    process.env.POLAR_PRODUCT_ANNUAL = "annual-id";
    process.env.POLAR_PRODUCT_MONTHLY = "monthly-id";

    const { plans, launchOffer } = getPublicBillingPlans();

    assert.equal(launchOffer.active, false);
    assert.deepEqual(plans.map((p) => p.id), ["free", "pro_annual", "pro_monthly"]);
    assert.equal(plans.some((p) => p.id === "pro_launch"), false);
  });
});

describe("validateCheckoutPriceId during launch", () => {
  it("allows pro_launch and blocks Pro SKUs", () => {
    process.env.LAUNCH_OFFER_ACTIVE = "true";
    process.env.POLAR_PRODUCT_LAUNCH = "694b0abe-c4af-4aa8-b67e-794392135307";

    assert.equal(validateCheckoutPriceId("pro_launch").ok, true);
    assert.equal(validateCheckoutPriceId("pro_annual").ok, false);
    assert.equal(validateCheckoutPriceId("pro_monthly").ok, false);
  });
});
