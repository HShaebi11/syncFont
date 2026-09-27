import { headers } from "next/headers";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ token: string }>;
}

function shareApiOrigin(headerList: Headers): string {
  const host = headerList.get("host");
  if (host) {
    const protocol = headerList.get("x-forwarded-proto") ?? "http";
    return `${protocol}://${host}`;
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:43124"
  );
}

export default async function SharePage({ params }: PageProps) {
  const { token } = await params;
  const origin = shareApiOrigin(await headers());
  const response = await fetch(`${origin}/api/share/${token}`, { cache: "no-store" });

  if (!response.ok) {
    return (
      <main className="mx-auto flex min-h-svh max-w-lg items-center px-6">
        <Card className="w-full">
          <CardHeader>
            <CardDescription>Shared from Typefolio</CardDescription>
            <CardTitle>Link unavailable</CardTitle>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const data = (await response.json()) as {
    familyName?: string | null;
    foundry?: string | null;
  };

  return (
    <main className="mx-auto flex min-h-svh max-w-lg items-center px-6">
      <Card className="w-full">
        <CardHeader>
          <CardDescription>Shared from Typefolio</CardDescription>
          <CardTitle>{data.familyName ?? "Shared item"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {data.foundry ?? "A typeface from a Typefolio library."}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
