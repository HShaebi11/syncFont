import { isAllowedDesktopRedirectUri } from "@typefolio/core/desktop-auth";

import { AuthShell } from "@/components/desktop-auth/auth-shell";
import { SignUpForm } from "@/components/desktop-auth/sign-up-form";

import { SignUpWebPage } from "./sign-up-web";

export const dynamic = "force-dynamic";

interface SignUpPageProps {
  searchParams: Promise<{ redirect_uri?: string; verify?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { redirect_uri: redirectUri, verify } = await searchParams;
  const safeRedirectUri =
    redirectUri && isAllowedDesktopRedirectUri(redirectUri) ? redirectUri : undefined;

  if (safeRedirectUri) {
    return (
      <AuthShell
        title={verify === "1" ? "Check your email" : "Create account"}
        description={
          verify === "1"
            ? "Verify your email to sync fonts with the Mac or iPad app."
            : "Create an account for Typefolio sync."
        }
      >
        <SignUpForm redirectUri={safeRedirectUri} showVerifyNotice={verify === "1"} />
      </AuthShell>
    );
  }

  return <SignUpWebPage initialVerify={verify === "1"} />;
}
