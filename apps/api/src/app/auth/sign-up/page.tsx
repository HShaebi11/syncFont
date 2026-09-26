import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/components/sign-up-form";
import { isAllowedDesktopRedirectUri } from "@typefolio/core/desktop-auth";

export const dynamic = "force-dynamic";

interface SignUpPageProps {
  searchParams: Promise<{
    redirect_uri?: string;
    verify?: string;
    email?: string;
    name?: string;
    plan?: string;
  }>;
}

function prefillText(value: string | undefined, maxLength: number): string {
  if (!value) {
    return "";
  }
  const trimmed = value.trim().slice(0, maxLength);
  if (!trimmed || /[\u0000-\u001F\u007F]/.test(trimmed)) {
    return "";
  }
  return trimmed;
}

function prefillEmail(value: string | undefined): string {
  const text = prefillText(value, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? text : "";
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { redirect_uri: redirectUri, verify, email, name, plan } = await searchParams;
  const safeRedirectUri =
    redirectUri && isAllowedDesktopRedirectUri(redirectUri) ? redirectUri : undefined;
  const proIntent = plan === "pro";

  return (
    <AuthShell
      title={verify === "1" ? "Check your email" : "Create account"}
      description={
        verify === "1"
          ? "Verify your email to sync fonts with the Mac or iPad app."
          : proIntent
            ? "Create your account to start the 2-week Pro trial. Launch price is £20/year, locked in for early users."
            : "Create an account for Typefolio sync. The web library is being redesigned — use the native apps after sign-in."
      }
    >
      <SignUpForm
        redirectUri={safeRedirectUri}
        showVerifyNotice={verify === "1"}
        defaultEmail={prefillEmail(email)}
        defaultName={prefillText(name, 80)}
      />
    </AuthShell>
  );
}
