export type EarlyAccessPlan = "free" | "pro";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function prefillText(value: string | null | undefined, maxLength: number): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim().slice(0, maxLength);
  if (!trimmed || /[\u0000-\u001F\u007F]/.test(trimmed)) {
    return "";
  }

  return trimmed;
}

export function prefillEmail(value: string | null | undefined): string {
  const text = prefillText(value, 254);
  return EMAIL_PATTERN.test(text) ? text : "";
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Add your email to continue.";
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return "That email doesn’t look quite right.";
  }
  return null;
}

export function validateAccount(input: { name: string; password: string }): string | null {
  if (!input.name.trim()) {
    return "Tell us what to call you.";
  }
  if (input.password.length < 8) {
    return "Use at least 8 characters.";
  }
  if (input.password.length > 128) {
    return "Keep the password under 128 characters.";
  }
  return null;
}

export function accountContinueUrl(
  apiBase: string,
  appBase: string | null,
  fields: { email: string; name: string; plan: EarlyAccessPlan | null },
): string {
  const url = new URL("/auth/sign-up", appBase || apiBase);
  const email = prefillEmail(fields.email);
  const name = prefillText(fields.name, 80);
  if (email) {
    url.searchParams.set("email", email);
  }
  if (name) {
    url.searchParams.set("name", name);
  }
  if (fields.plan === "pro") {
    url.searchParams.set("plan", "pro");
  }
  return url.toString();
}

export function signInUrl(apiBase: string, appBase: string | null): string {
  if (appBase) {
    return new URL("/auth/sign-in", appBase).toString();
  }
  return new URL("/auth/desktop", apiBase).toString();
}

function messageFromAuth(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }

  if (record.error && typeof record.error === "object") {
    const nested = record.error as Record<string, unknown>;
    if (typeof nested.message === "string" && nested.message.trim()) {
      return nested.message.trim();
    }
  }

  if (typeof record.error === "string" && record.error.trim()) {
    return record.error.trim();
  }

  return null;
}

export async function createAccount(input: {
  apiBase: string;
  email: string;
  name: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; message: string; offerContinue: boolean }> {
  let response: Response;
  try {
    response = await fetch(new URL("/api/auth/sign-up/email", input.apiBase), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: input.email.trim(),
        name: input.name.trim(),
        password: input.password,
      }),
    });
  } catch {
    return {
      ok: false,
      message: "We couldn’t reach sign-up just now.",
      offerContinue: true,
    };
  }

  const type = response.headers.get("content-type") ?? "";
  const payload = type.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    return {
      ok: false,
      message: messageFromAuth(payload) ?? "Could not create your account.",
      offerContinue: response.status >= 500 || payload === null,
    };
  }

  return { ok: true };
}
