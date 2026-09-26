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
                className="mb-6 rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-relaxed text-ink-soft"
              >
                If checkout completed, Pro will show on your account once payment finishes.
                Sign in when you’re ready.
              </p>
            ) : null}

            <p className="text-xs font-medium tracking-[0.18em] text-ink-soft uppercase">Typefolio</p>
            <p className="mt-3 text-sm text-ink-soft">Early access · Mac first</p>
            <h1 className="mt-3 font-serif text-[clamp(2.55rem,4vw,3.9rem)] leading-[0.96] tracking-[-0.03em] text-balance">
              Your fonts, <span className="italic">on every device.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft text-pretty">
              The fonts you already own, kept together. Save your library in the cloud, browse it on
              the web, and sync it to your Mac when you want those files on the machine you design with.
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft text-pretty">
              We’re in early access, and Mac comes first. The app is Electron for now, with a native
              version later. This isn’t an App Store download yet.
            </p>

            <fieldset className="mt-6">
              <legend className="text-xs font-medium tracking-[0.14em] text-ink-soft uppercase">
                Two ways in
              </legend>
              <div className="mt-3 grid gap-3">
                <PlanChoice
                  pressed={plan === "free"}
                  name="Free"
                  price="£0"
                  onChoose={() => choosePlan("free")}
                >
                  Save and keep your font library in the cloud. Browse it on the web. No device sync.
                </PlanChoice>
                <PlanChoice
                  pressed={plan === "pro"}
                  name="Pro"
                  price="£20/year"
                  detail="then £40/year"
                  onChoose={() => choosePlan("pro")}
                >
                  The same library, plus sync to your Mac. £20/year is the launch price, locked in for
                  early users. Includes a 2-week free trial of Pro sync.
                </PlanChoice>
              </div>
            </fieldset>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft text-pretty">
              Early access is honest work in progress. The happy path works; some edges are still
              rough. If you try it now, you’re helping us sand them down.
            </p>
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
      className={`rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
        pressed ? "border-ink bg-white" : "border-line bg-paper hover:bg-white"
      }`}
    >
      <span className="flex items-baseline justify-between gap-4">
        <span className="text-base font-medium">{name}</span>
        <span className="text-right">
          <span className="block text-sm font-medium">{price}</span>
          {detail ? <span className="block text-xs text-ink-soft">{detail}</span> : null}
        </span>
      </span>
      <span className="mt-1.5 block text-sm leading-relaxed text-ink-soft">{children}</span>
      <span className="mt-3 block text-sm font-medium underline decoration-ink/30 underline-offset-4">
        {name === "Pro" ? "Start the 2-week trial" : "Try it free"}
      </span>
    </button>
  );
}
