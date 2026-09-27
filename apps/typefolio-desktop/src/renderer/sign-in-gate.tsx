"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/session-provider";

export function SignInGate({ children }: { children: React.ReactNode }) {
  const { signedIn, loading, signInWithBrowser, openSignUpInBrowser } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Typefolio</h1>
          <p className="mt-2 text-sm text-white/70">Your fonts, on every device.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => void signInWithBrowser()}>
            Sign in in browser
          </Button>
          <Button size="lg" variant="outline" onClick={() => void openSignUpInBrowser()}>
            Create account
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
