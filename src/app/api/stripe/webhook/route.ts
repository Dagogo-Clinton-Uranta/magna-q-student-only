import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, getStripeWebhookSecret } from "@/lib/payments/stripe";
import {
  InvalidContentLengthError,
  readBoundedWebhookBody,
  WebhookBodyTooLargeError,
} from "@/lib/payments/webhook-body";
import { processStripeWebhookEvent } from "@/lib/payments/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature)
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );

  let event: Stripe.Event;
  try {
    // Signature verification must receive the exact raw bytes. Calling json()
    // here would change the payload and make verification unreliable.
    const rawBody = await readBoundedWebhookBody(request);
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    if (error instanceof WebhookBodyTooLargeError)
      return NextResponse.json(
        { error: "Webhook body is too large." },
        { status: 413 },
      );
    if (error instanceof InvalidContentLengthError)
      return NextResponse.json(
        { error: "Invalid Content-Length." },
        { status: 400 },
      );
    console.warn("Rejected an invalid Stripe webhook signature", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 },
    );
  }

  try {
    const result = await processStripeWebhookEvent(event);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    // A 5xx response tells Stripe to retry transient database/provider errors.
    console.error("Stripe webhook processing failed", {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}
