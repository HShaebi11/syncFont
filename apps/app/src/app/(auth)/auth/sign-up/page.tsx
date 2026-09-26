"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

function prefillText(value: string | null, maxLength: number): string {
  if (!value) {
    return "";
  }
  const trimmed = value.trim().slice(0, maxLength);
  if (!trimmed || /[\u0000-\u001F\u007F]/.test(trimmed)) {
    return "";
  }
  return trimmed;
}

function prefillEmail(value: string | null): string {
  const text = prefillText(value, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? text : "";
}

function SignUpForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState(() => prefillEmail(params.get("email")));
  const [password, setPassword] = useState("");
  const [name, setName] = useState(() => prefillText(params.get("name"), 80));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const proIntent = params.get("plan") === "pro";

  return (
    <AuthCard title="Create account">
      {proIntent ? (
        <p className="text-sm text-muted-foreground">
          After you verify your email, you can start the 2-week Pro trial. Launch price is £20/year,
          locked in for early users.
        </p>
      ) : null}
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const result = await authClient.signUp.email({ email, password, name });
          if (result.error) {
            setError(result.error.message ?? "Could not create account.");
            return;
          }
          setError(null);
          setMessage("Check your email to verify your account.");
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {message ? (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
        <Button className="w-full" type="submit">
          Create account
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="underline">
          Already have an account
        </Link>
      </p>
    </AuthCard>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-md px-6 py-16 text-sm text-muted-foreground">Loading…</p>}>
      <SignUpForm />
    </Suspense>
  );
}
