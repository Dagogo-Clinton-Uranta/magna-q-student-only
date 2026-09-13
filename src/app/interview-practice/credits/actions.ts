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

type CheckoutStage =
  | "stripe_client"
  | "price_validation"
  | "purchase_record"
  | "app_url"
  | "customer_lookup"
  | "checkout_creation"
  | "checkout_recording";

function safeCheckoutError(error: unknown, stage: CheckoutStage) {
  const detail = error instanceof Error ? error.message : "";
  const providerCode =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";
  const providerType =
    typeof error === "object" && error && "type" in error
      ? String(error.type)
      : "";

  if (detail.includes("STRIPE_SECRET_KEY is required"))
    return "Stripe is not configured on this deployment: STRIPE_SECRET_KEY is missing.";
  if (detail.includes("STRIPE_INTERVIEW_MOCK_PRICE_ID is required"))
    return "The live $5 mock-interview Price ID is missing from this deployment.";
  if (detail.includes("STRIPE_INTERVIEW_COMPETENCY_PACK_PRICE_ID is required"))
    return "The live $10 competency-pack Price ID is missing from this deployment.";
  if (detail.includes("STRIPE_LIVE_MODE must be explicitly set"))
    return "STRIPE_LIVE_MODE must be set to true for live Stripe payments.";
  if (providerCode === "resource_missing" || detail.includes("No such price"))
    return "Stripe could not find that Price with the configured key. Use the live price_ ID with the live sk_live_ key.";
  if (
    providerType === "StripeAuthenticationError" ||
    detail.toLowerCase().includes("invalid api key")
  )
    return "Stripe rejected the configured secret key. Replace STRIPE_SECRET_KEY with the live sk_live_ key.";
  if (detail.includes("must point to the matching active one-time USD Price"))
    return "The configured Stripe Price must be active, one-time, and exactly $5 USD for a mock or $10 USD for a competency pack.";
  if (detail.includes("NEXT_PUBLIC_APP_URL is not configured"))
    return "NEXT_PUBLIC_APP_URL is missing. Set it to https://www.magna-q.com and redeploy.";
  if (stage === "purchase_record" || stage === "customer_lookup")
    return "The interview billing database could not be reached. Check the Supabase service-role configuration.";
  return "Stripe Checkout could not be created. Review the Vercel function log for the INTERVIEW_CHECKOUT_FAILED entry.";
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
  let stage: CheckoutStage = "stripe_client";
  try {
    const stripe = getStripe();
    stage = "price_validation";
    await verifyInterviewStripePrice(product, stripe);
    const priceId = getStripeInterviewPriceId(product);
    stage = "purchase_record";
    const service = createServiceRoleClient();
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

    stage = "app_url";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (!baseUrl) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
    stage = "customer_lookup";
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

    stage = "checkout_creation";
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: profile.id,
        line_items: [{ price: priceId, quantity: 1 }],
        billing_address_collection: "required",
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
    stage = "checkout_recording";
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
    const providerCode =
      typeof error === "object" && error && "code" in error
        ? String(error.code)
        : null;
    console.error("INTERVIEW_CHECKOUT_FAILED", {
      userId: profile.id,
      product,
      stage,
      providerCode,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    redirect(
      `/interview-practice/credits?product=${product}&returnTo=${encodeURIComponent(returnTo)}&error=${encodeURIComponent(safeCheckoutError(error, stage))}`,
    );
  }
}
