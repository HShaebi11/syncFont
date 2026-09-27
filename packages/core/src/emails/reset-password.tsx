import { Button, Text } from "react-email";

import { TypefolioEmailShell } from "./typefolio-email";

export interface ResetPasswordEmailProps {
  resetUrl: string;
}

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
  return (
    <TypefolioEmailShell
      preview="Reset your Typefolio password."
      title="Reset your password"
    >
      <Text className="m-0 text-base leading-6 text-muted">
        We received a request to reset the password for your Typefolio account. Use the button below
        to choose a new password.
      </Text>
      <Button
        href={resetUrl}
        className="mt-6 box-border rounded-md bg-ink px-5 py-3 text-center text-sm font-medium text-white no-underline"
      >
        Reset password
      </Button>
      <Text className="mt-6 mb-0 text-sm leading-5 text-subtle">
        If the button does not work, paste this link into your browser:
        <br />
        <span className="break-all text-muted">{resetUrl}</span>
      </Text>
      <Text className="mt-6 mb-0 text-sm text-subtle">
        If you did not request a password reset, you can safely ignore this email.
      </Text>
    </TypefolioEmailShell>
  );
}

ResetPasswordEmail.PreviewProps = {
  resetUrl: "https://app.typefolio.app/api/auth/reset-password?token=example",
} satisfies ResetPasswordEmailProps;

export default ResetPasswordEmail;
