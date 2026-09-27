import { Button, Text } from "react-email";

import { TypefolioEmailShell } from "./typefolio-email";

export interface VerifyEmailProps {
  verifyUrl: string;
}

export function VerifyEmail({ verifyUrl }: VerifyEmailProps) {
  return (
    <TypefolioEmailShell
      preview="Confirm your email to upload and sync fonts."
      title="Verify your email"
    >
      <Text className="m-0 text-base leading-6 text-muted">
        Thanks for signing up. Confirm your email address so you can upload fonts to your library
        and sync them with the desktop app.
      </Text>
      <Button
        href={verifyUrl}
        className="mt-6 box-border rounded-md bg-ink px-5 py-3 text-center text-sm font-medium text-white no-underline"
      >
        Verify email
      </Button>
      <Text className="mt-6 mb-0 text-sm leading-5 text-subtle">
        If the button does not work, paste this link into your browser:
        <br />
        <span className="break-all text-muted">{verifyUrl}</span>
      </Text>
      <Text className="mt-6 mb-0 text-sm text-subtle">
        If you did not create a Typefolio account, you can ignore this message.
      </Text>
    </TypefolioEmailShell>
  );
}

VerifyEmail.PreviewProps = {
  verifyUrl: "https://app.typefolio.app/api/auth/verify-email?token=example",
} satisfies VerifyEmailProps;

export default VerifyEmail;
