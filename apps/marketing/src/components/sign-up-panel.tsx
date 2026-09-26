"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import {
  accountContinueUrl,
  createAccount,
  signInUrl,
  validateAccount,
  validateEmail,
  type EarlyAccessPlan,
} from "@/lib/account";

type Step = "email" | "account" | "verify";

const fieldClass =
  "auth-field mt-2 w-full rounded-lg border border-field-line bg-field px-3 py-2.5 text-base text-panel-text outline-none placeholder:text-[#c9c2b6] focus-visible:border-cream focus-visible:ring-2 focus-visible:ring-cream/70";

export function SignUpPanel({
  apiBase,
  appBase,
  plan,
}: {
  apiBase: string;
  appBase: string | null;
  plan: EarlyAccessPlan | null;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [offerContinue, setOfferContinue] = useState(false);
  const [pending, setPending] = useState(false);
  const verifyHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorId = useId();

  useEffect(() => {
    if (step === "verify") {
      verifyHeadingRef.current?.focus();
    }
  }, [step]);

  const continueHref = accountContinueUrl(apiBase, appBase, { email, name, plan });
  const signInHref = signInUrl(apiBase, appBase);
  const signInLabel = appBase ? "Sign in on the web" : "Sign in from the Mac app";

  function goToAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = validateEmail(email);
    setError(nextError);
    setOfferContinue(false);
    if (nextError) {
      return;
    }
    setStep("account");
    requestAnimationFrame(() => {
      document.getElementById("sign-up-name")?.focus();
    });
  }

  async function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailError = validateEmail(email);
    const accountError = emailError ?? validateAccount({ name, password });
    setError(accountError);
    setOfferContinue(false);
    if (accountError) {
      return;
    }

    setPending(true);
    const result = await createAccount({
      apiBase,
      email,
      name,
      password,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      setOfferContinue(result.offerContinue);
      return;
    }

    setPassword("");
    setError(null);
    setStep("verify");
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="text-xs font-medium tracking-[0.16em] text-panel-muted uppercase">
        {step === "verify" ? "Step 3 of 3" : step === "account" ? "Step 2 of 3" : "Step 1 of 3"}
      </p>
      <ol className="mt-3 flex gap-3 text-xs text-panel-muted" aria-label="Sign-up progress">
        <ProgressItem current={step === "email"} done={step !== "email"}>
          Email
        </ProgressItem>
        <ProgressItem current={step === "account"} done={step === "verify"}>
          Account
        </ProgressItem>
        <ProgressItem current={step === "verify"} done={false}>
          Verify
        </ProgressItem>
      </ol>

      {step === "verify" ? (
        <div className="mt-8">
          <h2
            ref={verifyHeadingRef}
            tabIndex={-1}
            className="font-serif text-4xl tracking-tight text-panel-text outline-none"
          >
            Check your email
          </h2>
          <p className="mt-4 text-base leading-relaxed text-panel-muted">
            We’ve sent a verification link to <span className="text-panel-text">{email.trim()}</span>.
            Open it to finish creating your account, then sign in.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-panel-muted">
            {plan === "pro"
              ? "After that, you can start the 2-week trial of Pro sync at the £20/year launch price, locked in for early users."
              : "After that, your library is there to browse on the web. Device sync is the Pro bit."}
          </p>
          <a
            href={signInHref}
            className="mt-8 inline-flex rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            {signInLabel}
          </a>
        </div>
      ) : (
        <>
          <h2 className="mt-8 font-serif text-4xl tracking-tight text-panel-text">
            {step === "account" ? "Create your account" : "Start with your email"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-panel-muted">
            {plan === "pro"
              ? "Pro includes a 2-week trial of sync, then £20/year locked in for early users."
              : plan === "free"
                ? "Free keeps your library in the cloud and lets you browse it on the web. No device sync."
                : "Same account either way. Free is the library. Pro adds sync."}
          </p>

          {step === "email" ? (
            <form className="mt-8" noValidate onSubmit={goToAccount}>
              <label htmlFor="sign-up-email" className="text-sm font-medium text-panel-text">
                Email
              </label>
              <input
                id="sign-up-email"
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                inputMode="email"
                value={email}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                placeholder="you@studio.com"
                className={fieldClass}
              />
              <FormError id={errorId} message={error} />
              <button
                type="submit"
                className="mt-6 inline-flex w-full justify-center rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              >
                Continue
              </button>
            </form>
          ) : (
            <form className="mt-8" noValidate aria-busy={pending} onSubmit={(event) => void submitAccount(event)}>
              <p className="text-sm text-panel-muted">
                Using <span className="text-panel-text">{email.trim()}</span>
                {" · "}
                <button
                  type="button"
                  className="underline decoration-panel-muted/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                  onClick={() => {
                    setStep("email");
                    setPassword("");
                    setError(null);
                    setOfferContinue(false);
                    requestAnimationFrame(() => {
                      document.getElementById("sign-up-email")?.focus();
                    });
                  }}
                >
                  Use a different email
                </button>
              </p>
              <div className="mt-5">
                <label htmlFor="sign-up-name" className="text-sm font-medium text-panel-text">
                  Name
                </label>
                <input
                  id="sign-up-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  disabled={pending}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError(null);
                    setOfferContinue(false);
                  }}
                  className={fieldClass}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="sign-up-password" className="text-sm font-medium text-panel-text">
                  Password
                </label>
                <input
                  id="sign-up-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  disabled={pending}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : "sign-up-password-hint"}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                    setOfferContinue(false);
                  }}
                  className={fieldClass}
                />
                <p id="sign-up-password-hint" className="mt-2 text-xs text-panel-muted">
                  At least 8 characters.
                </p>
              </div>
              <FormError id={errorId} message={error} />
              {offerContinue ? (
                <a
                  href={continueHref}
                  className="mt-3 inline-flex text-sm font-medium text-panel-text underline decoration-panel-muted/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                >
                  Continue on the account page
                </a>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="mt-6 inline-flex w-full justify-center rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream disabled:cursor-wait disabled:opacity-70"
              >
                {pending ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-panel-muted">
            Already have an account?{" "}
            <a
              href={signInHref}
              className="font-medium text-panel-text underline decoration-panel-muted/60 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              {signInLabel}
            </a>
          </p>
        </>
      )}
    </div>
  );
}

function ProgressItem({
  current,
  done,
  children,
}: {
  current: boolean;
  done: boolean;
  children: string;
}) {
  return (
    <li
      aria-current={current ? "step" : undefined}
      className={current ? "font-medium text-panel-text" : done ? "text-panel-muted" : undefined}
    >
      {children}
    </li>
  );
}

function FormError({ id, message }: { id: string; message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} role="alert" className="mt-3 text-sm text-danger">
      {message}
    </p>
  );
}
