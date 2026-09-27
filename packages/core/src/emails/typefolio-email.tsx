import type { ReactNode } from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  pixelBasedPreset,
} from "react-email";

import { getAppOrigin, getMarketingOrigin } from "@typefolio/core/auth/config";

const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        muted: "#525252",
        subtle: "#737373",
        line: "#e5e5e5",
        surface: "#fafafa",
      },
    },
  },
};

export function TypefolioEmailShell({
  preview,
  title,
  children,
}: {
  preview: string;
  title: string;
  children: ReactNode;
}) {
  const marketingOrigin = getMarketingOrigin();

  return (
    <Html lang="en">
      <Tailwind config={tailwindConfig}>
        <Head />
        <Body className="bg-surface font-sans">
          <Preview>{preview}</Preview>
          <Container className="mx-auto max-w-xl px-6 py-10">
            <Text className="m-0 text-xs font-medium uppercase tracking-wide text-subtle">
              Typefolio
            </Text>
            <Heading className="mt-3 mb-0 text-2xl font-semibold tracking-tight text-ink">
              {title}
            </Heading>
            <Section className="mt-6">{children}</Section>
            <Hr className="mt-10 border-none border-t border-solid border-line" />
            <Text className="mt-6 mb-0 text-sm text-subtle">
              <Link href={marketingOrigin} className="text-ink no-underline">
                typefolio.app
              </Link>
              {" · "}
              <Link href={getAppOrigin()} className="text-ink no-underline">
                Open library
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
