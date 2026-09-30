const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function resendPost(
  apiKey: string,
  path: string,
  body: Record<string, unknown>,
): Promise<{ error?: { message: string } }> {
  const response = await fetch(`https://api.resend.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as { message?: string };
  if (!response.ok) {
    return { error: { message: data.message ?? `Resend error ${response.status}` } };
  }
  return {};
}

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!emailPattern.test(email)) {
    return Response.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const audienceId = process.env.TOOLSHELF_RESEND_AUDIENCE_ID?.trim();
  const notifyTo = process.env.TOOLSHELF_WAITLIST_NOTIFY_EMAIL?.trim();
  const from = process.env.RESEND_FROM?.trim() ?? "Toolshelf <onboarding@resend.dev>";

  if (!apiKey) {
    return Response.json(
      {
        ok: false,
        error: "Waitlist is not configured yet. Set RESEND_API_KEY on the deployment.",
      },
      { status: 503 },
    );
  }

  if (audienceId) {
    const { error } = await resendPost(apiKey, "/audiences/" + audienceId + "/contacts", {
      email,
      unsubscribed: false,
    });
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 502 });
    }
  }

  if (notifyTo) {
    const { error } = await resendPost(apiKey, "/emails", {
      from,
      to: [notifyTo],
      subject: "Toolshelf waitlist signup",
      text: `New waitlist signup: ${email}`,
    });
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 502 });
    }
  }

  if (!audienceId && !notifyTo) {
    return Response.json(
      {
        ok: false,
        error: "Set TOOLSHELF_RESEND_AUDIENCE_ID or TOOLSHELF_WAITLIST_NOTIFY_EMAIL.",
      },
      { status: 503 },
    );
  }

  return Response.json({ ok: true });
}
