import { Link, Text } from "react-email";

import { getAppOrigin, getMarketingOrigin } from "@typefolio/core/auth/config";

import { FounderEmailShell } from "./founder-email";

export interface WelcomeThanksEmailProps {
  firstName: string;
  founderName: string;
}

export function WelcomeThanksEmail({ firstName, founderName }: WelcomeThanksEmailProps) {
  const appOrigin = getAppOrigin();
  const downloadsUrl = `${getMarketingOrigin()}/downloads`;
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  return (
    <FounderEmailShell preview="Thanks for trying Typefolio — quick note from me.">
      <Text className="m-0 text-base leading-7 text-ink">{greeting}</Text>
      <Text className="mt-4 mb-0 text-base leading-7 text-ink">
        I&apos;m {founderName}. I built Typefolio because I wanted a simple place to keep my own fonts
        and have them show up on every device I work from.
      </Text>
      <Text className="mt-4 mb-0 text-base leading-7 text-ink">
        Thank you for trying it early. If anything feels confusing or broken, reply to this email — I
        read every message.
      </Text>
      <Text className="mt-4 mb-0 text-base leading-7 text-ink">
        When you have a minute: upload a font in your{" "}
        <Link href={appOrigin} className="text-ink underline">
          library
        </Link>
        , then grab the{" "}
        <Link href={downloadsUrl} className="text-ink underline">
          desktop app
        </Link>{" "}
        to sync.
      </Text>
      <Text className="mt-8 mb-0 text-base leading-7 text-ink">
        Thanks again,
        <br />
        {founderName}
      </Text>
    </FounderEmailShell>
  );
}

WelcomeThanksEmail.PreviewProps = {
  firstName: "Alex",
  founderName: "Hamza",
} satisfies WelcomeThanksEmailProps;

export default WelcomeThanksEmail;
