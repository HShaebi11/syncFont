import type { ReactElement } from "react";
import { render } from "react-email";
import { Resend } from "resend";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

/** Product/auth mail — verify, password reset, etc. */
export function getAuthFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Typefolio <onboarding@resend.dev>"
  );
}

/** Personal founder note — separate From in Resend (not hello@ / auth). */
export function getFounderFromAddress(): string | null {
  const value = process.env.TYPEFOLIO_FOUNDER_FROM_EMAIL?.trim();
  return value || null;
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
}): Promise<void> {
  const resend = getResendClient();
  const text = await render(input.react, { plainText: true });
  const from = input.from ?? getAuthFromAddress();

  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email:dev]", from, input.subject, input.to, text);
      return;
    }
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    react: input.react,
    text,
    replyTo: input.replyTo,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/** @deprecated Use sendTransactionalEmail or helpers in send-emails.ts */
export async function sendAuthEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email:dev]", input.subject, input.to, input.text);
      return;
    }
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const { error } = await resend.emails.send({
    from: getAuthFromAddress(),
    to: input.to,
    subject: input.subject,
    text: input.text,
  });

  if (error) {
    throw new Error(error.message);
  }
}
