import { ResetPasswordEmail } from "../emails/reset-password";
import { VerifyEmail } from "../emails/verify-email";
import { WelcomeThanksEmail } from "../emails/welcome-thanks";

import { getFounderFromAddress, sendTransactionalEmail } from "./email";

export function getFounderName(): string {
  return process.env.TYPEFOLIO_FOUNDER_NAME?.trim() || "Hamza";
}

function firstNameFromUser(name: string | null | undefined): string {
  const trimmed = name?.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.split(/\s+/)[0] ?? "";
}

export async function sendVerifyEmail(input: {
  to: string;
  verifyUrl: string;
}): Promise<void> {
  await sendTransactionalEmail({
    to: input.to,
    subject: "Verify your Typefolio email",
    react: <VerifyEmail verifyUrl={input.verifyUrl} />,
  });
}

export async function sendResetPasswordEmail(input: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  await sendTransactionalEmail({
    to: input.to,
    subject: "Reset your Typefolio password",
    react: <ResetPasswordEmail resetUrl={input.resetUrl} />,
  });
}

export async function sendWelcomeThanksEmail(input: {
  to: string;
  name?: string | null;
}): Promise<void> {
  const from = getFounderFromAddress();
  if (!from) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[email:dev] Skipping founder welcome — set TYPEFOLIO_FOUNDER_FROM_EMAIL for personal sends.",
        input.to,
      );
    }
    return;
  }

  const founderName = getFounderName();

  await sendTransactionalEmail({
    from,
    to: input.to,
    subject: "Thanks for trying Typefolio",
    react: (
      <WelcomeThanksEmail
        firstName={firstNameFromUser(input.name)}
        founderName={founderName}
      />
    ),
  });
}
