"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/session-provider";

export function SignOutButton() {
  const { signOut } = useSession();
  return (
    <Button variant="outline" onClick={() => void signOut()}>
      Sign out
    </Button>
  );
}
