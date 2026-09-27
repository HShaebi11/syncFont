import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";

import { handlePolarSubscriptionEvent } from "@typefolio/core/billing/polar-webhook";

const SUBSCRIPTION_EVENT_TYPES = new Set([
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.canceled",
  "subscription.uncanceled",
  "subscription.revoked",
]);

async function handleSubscriptionEvent(
  eventType: string,
  webhookId: string,
  subscription: Subscription,
): Promise<void> {
  await handlePolarSubscriptionEvent({
    eventId: webhookId || `${eventType}:${subscription.id}`,
    eventType,
    subscription,
  });
}

export async function POST(request: Request): Promise<Response> {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET ?? "";
  const body = await request.text();

  let event: ReturnType<typeof validateEvent>;
  try {
    event = validateEvent(
      body,
      {
        "webhook-id": request.headers.get("webhook-id") ?? "",
        "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
        "webhook-signature": request.headers.get("webhook-signature") ?? "",
      },
      webhookSecret,
    );
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return Response.json({ received: false }, { status: 403 });
    }
    throw error;
  }

  const webhookId = request.headers.get("webhook-id") ?? "";

  switch (event.type) {
    case "order.paid":
      // TODO: Fulfill paid orders (grant entitlements, send receipt, sync DB).
      break;

    case "customer.state_changed":
      // TODO: React to Polar customer state changes (entitlements, access flags).
      break;

    default:
      if (SUBSCRIPTION_EVENT_TYPES.has(event.type)) {
        await handleSubscriptionEvent(
          event.type,
          webhookId,
          event.data as Subscription,
        );
      }
      break;
  }

  return Response.json({ received: true });
}
