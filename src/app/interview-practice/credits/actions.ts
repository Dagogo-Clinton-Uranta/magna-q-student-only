"use server";

import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/lib/auth/guards";
import { sanitizeReturnPath } from "@/lib/payments/return-path";
import {
  getStripe,
  getStripeInterviewPriceId,
  interviewProductDetails,
  type InterviewProductKind,
  verifyInterviewStripePrice,
} from "@/lib/payments/stripe";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

function productFrom(value: FormDataEntryValue | null): InterviewProductKind {
  return value === "mock_interview" ? "mock_interview" : "competency_pack";
}

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export async function createInterviewCreditCheckout(formData: FormData) {
  const profile = await requireRole(["student"]);
  const user = await requireUser();
  const product = productFrom(formData.get("product"));
  const returnTo = sanitizeReturnPath(
    formData.get("returnTo"),
    product === "mock_interview"
      ? "/interview-practice/mock"
      : "/interview-practice/sessions",
  );
  if (!user.email)
    redirect(
      `/interview-practice/credits?product=${product}&returnTo=${encodeURIComponent(returnTo)}&error=${encodeURIComponent("Add an email address to your account before paying.")}`,
    );

  const purchaseId = crypto.randomUUID();
  const details = interviewProductDetails(product);
  const service = createServiceRoleClient();
  try {
    const stripe = getStripe();
    await verifyInterviewStripePrice(product, stripe);
    const priceId = getStripeInterviewPriceId(product);
    const { error: purchaseError } = await service
      .from("interview_credit_purchases")
      .insert({
        id: purchaseId,
        user_id: profile.id,
        product_kind: product,
        credit_quantity: details.credits,
        amount_minor: details.amountMinor,
        currency: "usd",
        stripe_price_id: priceId,
        status: "pending",
      });
    if (purchaseError) throw purchaseError;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (!baseUrl) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
    const { data: billing } = await service
      .from("billing_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", profile.id)
      .maybeSingle();
    const metadata = {
      magna_q_purchase_id: purchaseId,
      magna_q_user_id: profile.id,
      magna_q_interview_product: product,
    };
    const successUrl = new URL("/interview-practice/credits/return", baseUrl);
    successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
    successUrl.searchParams.set("returnTo", returnTo);
    const cancelUrl = new URL("/interview-practice/credits", baseUrl);
    cancelUrl.searchParams.set("product", product);
    cancelUrl.searchParams.set("returnTo", returnTo);
    cancelUrl.searchParams.set("canceled", "1");

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: profile.id,
        line_items: [{ price: priceId, quantity: 1 }],
        billing_address_collection: "required",
        payment_method_collection: "always",
        success_url: successUrl.toString(),
        cancel_url: cancelUrl.toString(),
        metadata,
        payment_intent_data: {
          description: `Magna-Q: ${details.description}`,
          metadata,
        },
        ...(billing?.stripe_customer_id
          ? {
              customer: String(billing.stripe_customer_id),
              customer_update: { address: "auto", name: "auto" },
            }
          : { customer_email: user.email }),
      },
      { idempotencyKey: `interview-credit:${profile.id}:${purchaseId}` },
    );
    const { error: recordError } = await service
      .from("interview_credit_purchases")
      .update({
        stripe_checkout_session_id: session.id,
        stripe_customer_id: stripeId(session.customer),
      })
      .eq("id", purchaseId)
      .eq("user_id", profile.id);
    if (recordError) throw recordError;
    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    redirect(session.url);
  } catch (error) {
    if (
      error instanceof Error &&
      (error as Error & { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
    )
      throw error;
    console.error("Interview credit Checkout creation failed", {
      userId: profile.id,
      product,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    redirect(
      `/interview-practice/credits?product=${product}&returnTo=${encodeURIComponent(returnTo)}&error=${encodeURIComponent("We could not open secure checkout. Check the Stripe setup or try again.")}`,
    );
  }
}
