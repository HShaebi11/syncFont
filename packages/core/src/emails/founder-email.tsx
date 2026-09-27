import type { ReactNode } from "react";
import { Body, Container, Head, Html, Preview, Tailwind, pixelBasedPreset } from "react-email";

/** Plain letter-style wrapper — not the branded auth/product templates. */
export function FounderEmailShell({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                ink: "#171717",
              },
            },
          },
        }}
      >
        <Head />
        <Body className="bg-white font-sans">
          <Preview>{preview}</Preview>
          <Container className="mx-auto max-w-xl px-2 py-6">{children}</Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
