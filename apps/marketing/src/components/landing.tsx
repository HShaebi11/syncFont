"use client";

import { useState } from "react";

import { SignUpPanel } from "@/components/sign-up-panel";
import type { EarlyAccessPlan } from "@/lib/account";

export function Landing({
  apiBase,
  appBase,
  initialPlan,
  checkoutSuccess,
}: {
  apiBase: string;
  appBase: string | null;
  initialPlan: EarlyAccessPlan | null;
  checkoutSuccess: boolean;
}) {
  const [plan, setPlan] = useState<EarlyAccessPlan | null>(initialPlan);

  function choosePlan(next: EarlyAccessPlan) {
    setPlan(next);
    const panel = document.getElementById("sign-up");
    panel?.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => {
      document.getElementById("sign-up-email")?.focus();
    });
  }

  return (
    <main className="flex min-h-screen w-full flex-col bg-paper text-ink lg:h-screen lg:flex-row lg:overflow-hidden">
      <section className="flex w-full flex-col lg:h-full lg:min-h-0 lg:w-1/2 lg:overflow-y-auto lg:overscroll-contain">
        <div className="my-auto w-full px-6 py-8 sm:px-10 lg:px-12 lg:py-8 xl:px-16">
          <div className="max-w-xl">
            {checkoutSuccess ? (
              <p
                role="status"
                className="mb-6 border border-ink bg-paper px-4 py-3 text-sm leading-relaxed text-ink-soft"
              >
                If checkout completed, Pro will show on your account once payment finishes.
                Sign in when you’re ready.
              </p>
            ) : null}

            <p className="text-xs font-medium tracking-[0.18em] text-ink-soft uppercase">Typefolio</p>
            <p className="mt-3 text-sm text-ink-soft">Early access · Mac first</p>
            <h1 className="mt-3 text-[clamp(2.55rem,4vw,3.9rem)] leading-[0.96] tracking-[-0.03em] text-balance">
              Your fonts, on every device.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft text-pretty">
              Keep the fonts you already own in one library — in the cloud, on the web, and on your
              Mac. The Mac app is Electron for now.
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft text-pretty">
              Early access is honest work in progress. The happy path works; some edges are still
              rough. If you try it now, you’re helping us sand them down.
            </p>

            <fieldset className="mt-6">
              <legend className="sr-only">Plans</legend>
              <div className="grid gap-3">
                <PlanChoice
                  pressed={plan === "free"}
                  name="Free"
                  price="£0"
                  onChoose={() => choosePlan("free")}
                >
                  Save your fonts in the cloud. Browse on the web. No sync.
                </PlanChoice>
                <PlanChoice
                  pressed={plan === "pro"}
                  name="Pro"
                  price="£20/year"
                  detail="locked in forever"
                  onChoose={() => choosePlan("pro")}
                >
                  Founding price for people who join now. Later, new customers pay £40/year. Sync to your Mac, with a 2-week trial.
                </PlanChoice>
              </div>
            </fieldset>
          </div>
        </div>
      </section>

      <section
        id="sign-up"
        className="scheme-dark flex w-full flex-col bg-panel text-panel-text lg:h-full lg:min-h-0 lg:w-1/2 lg:overflow-y-auto lg:overscroll-contain"
      >
        <div className="my-auto w-full px-6 py-10 sm:px-10 lg:px-12 lg:py-12 xl:px-16">
          <SignUpPanel apiBase={apiBase} appBase={appBase} plan={plan} />
        </div>
      </section>
    </main>
  );
}

function PlanChoice({
  pressed,
  name,
  price,
  detail,
  children,
  onChoose,
}: {
  pressed: boolean;
  name: string;
  price: string;
  detail?: string;
  children: string;
  onChoose: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onChoose}
      className={`border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
        pressed ? "border-ink bg-ink text-paper" : "border-ink bg-paper text-ink hover:bg-neutral-100"
      }`}
    >
      <span className="flex items-baseline justify-between gap-4">
        <span className="text-base font-medium">{name}</span>
        <span className="text-right">
          <span className="block text-sm font-medium">{price}</span>
          {detail ? <span className="block text-xs opacity-70">{detail}</span> : null}
        </span>
      </span>
      <span className="mt-1.5 block text-sm leading-relaxed opacity-80">{children}</span>
      <span className="mt-3 block text-sm font-medium underline decoration-current/40 underline-offset-4">
        {name === "Pro" ? "Start the 2-week trial" : "Try it free"}
      </span>
    </button>
  );
}
