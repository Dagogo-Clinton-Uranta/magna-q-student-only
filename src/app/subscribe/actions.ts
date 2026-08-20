"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";
import {
  getStudentEntitlement,
  requireRole,
  requireUser,
} from "@/lib/auth/guards";
import { sanitizeReturnPath } from "@/lib/payments/return-path";
import {
  getStripe,
  getStripeMonthlyPriceId,
  verifyMonthlyStripePrice,
} from "@/lib/payments/stripe";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function isExpectedSubscription(
  subscription: Stripe.Subscription,
  expectedPriceId: string,
) {
  const item = subscription.items.data[0];
  return (
    subscription.items.data.length === 1 &&
    item?.quantity === 1 &&
    item.price.id === expectedPriceId &&
    item.price.billing_scheme === "per_unit" &&
    item.price.currency.toLowerCase() === "usd" &&
    item.price.unit_amount === 10_000 &&
    item.price.recurring?.interval === "month" &&
    item.price.recurring.interval_count === 1 &&
    item.price.recurring.usage_type === "licensed" &&
    item.price.transform_quantity == null
  );
}

/**
 * Creates a Stripe-hosted subscription Checkout. Card data is entered directly
 * on Stripe's page, so Magna-Q never receives or stores full card numbers.
 */
export async function createSubscriptionCheckout(formData: FormData) {
  const profile = await requireRole(["student"]);
  const user = await requireUser();
  const localEntitlement = await getStudentEntitlement(profile);
  const returnTo = sanitizeReturnPath(
    typeof formData.get("returnTo") === "string"
      ? String(formData.get("returnTo"))
      : null,
  );

  if (localEntitlement.hasAccess) redirect(returnTo);

  if (!user.email)
    redirect(
      `/subscribe?returnTo=${encodeURIComponent(returnTo)}&error=${encodeURIComponent("Add an email address to your account before paying.")}`,
    );

  try {
    const stripe = getStripe();
    // Validate the Dashboard Price on every Checkout creation. A stale cache
    // must never let an incorrect price charge a student or grant entitlement.
    await verifyMonthlyStripePrice(stripe);
    const priceId = getStripeMonthlyPriceId();
    // This Server Action has authenticated the student above. The billing table
    // intentionally denies browser/user writes, so this trusted projection uses
    // the server-only service-role client instead of weakening Row Level Security.
    const serviceClient = createServiceRoleClient();
    const { data: billing, error: billingError } = await serviceClient
      .from("billing_subscriptions")
      .select(
        "stripe_customer_id,stripe_subscription_id,status,current_period_end,last_checkout_session_id,checkout_attempt_id",
      )
      .eq("user_id", profile.id)
      .maybeSingle();
    if (billingError) throw billingError;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (!baseUrl) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");

    if (billing?.stripe_subscription_id) {
      let existingSubscription: Stripe.Subscription | null = null;
      try {
        existingSubscription = await stripe.subscriptions.retrieve(
          String(billing.stripe_subscription_id),
        );
      } catch (error) {
        // Only a provider-confirmed missing object is treated as absent. A
        // timeout or authentication error must not fall through and create a
        // second subscription while the first one may still be active.
        if (!(
          error instanceof stripe.errors.StripeInvalidRequestError &&
          error.code === "resource_missing"
        ))
          throw error;
      }

      if (
        existingSubscription &&
        isExpectedSubscription(existingSubscription, priceId)
      ) {
        const subscriptionItem = existingSubscription.items.data[0];
        if (
          existingSubscription.status === "active" &&
          subscriptionItem &&
          subscriptionItem.current_period_end * 1_000 > Date.now()
        ) {
          // Stripe already has a current subscription, but our signed webhook
          // projection has not granted access yet. Never create a duplicate;
          // send the student to the status screen while Stripe retries delivery.
          const pendingUrl = new URL("/subscription/return", baseUrl);
          pendingUrl.searchParams.set("returnTo", returnTo);
          redirect(pendingUrl.toString());
        }

        if (
          !["canceled", "incomplete_expired"].includes(
            existingSubscription.status,
          )
        ) {
          const customerId = stripeId(existingSubscription.customer);
          if (!customerId)
            throw new Error(
              "The existing Stripe subscription has no customer.",
            );
          const portalReturnUrl = new URL("/subscription/return", baseUrl);
          portalReturnUrl.searchParams.set("returnTo", returnTo);

          // A past-due, unpaid, paused, trialing, or incomplete subscription
          // must be repaired in Billing Portal. Creating a new Checkout here
          // could leave the student with two monthly subscriptions.
          const portal = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: portalReturnUrl.toString(),
          });
          redirect(portal.url);
        }
      } else if (existingSubscription) {
        throw new Error(
          "The existing Stripe subscription does not match the configured monthly plan.",
        );
      }
    }

    let replaceCheckoutAttemptId: string | null = null;
    if (billing?.last_checkout_session_id) {
      let priorSession: Stripe.Checkout.Session | null = null;
      try {
        priorSession = await stripe.checkout.sessions.retrieve(
          String(billing.last_checkout_session_id),
          { expand: ["line_items"] },
        );
      } catch (error) {
        if (!(
          error instanceof stripe.errors.StripeInvalidRequestError &&
          error.code === "resource_missing"
        ))
          throw error;
      }
      const priorItems = priorSession?.line_items?.data ?? [];
      if (
        priorSession?.status === "open" &&
        priorSession.expires_at * 1_000 > Date.now()
      ) {
        if (
          priorSession.url &&
          priorSession.mode === "subscription" &&
          priorSession.client_reference_id === profile.id &&
          priorItems.length === 1 &&
          priorItems[0]?.price?.id === priceId &&
          priorItems[0]?.quantity === 1
        )
          redirect(priorSession.url);

        // An open Session may already be displayed in another tab. Never
        // rotate its attempt and leave two concurrently completable monthly
        // subscriptions merely because its stored parameters look unexpected.
        throw new Error(
          "The existing open Stripe Checkout Session could not be safely reused.",
        );
      }

      if (priorSession?.status === "complete") {
        if (
          priorSession.mode !== "subscription" ||
          priorSession.client_reference_id !== profile.id ||
          priorItems.length !== 1 ||
          priorItems[0]?.price?.id !== priceId ||
          priorItems[0]?.quantity !== 1
        )
          throw new Error(
            "The completed Stripe Checkout Session does not match this student plan.",
          );

        const completedSubscriptionId = stripeId(priorSession.subscription);
        if (!completedSubscriptionId)
          throw new Error(
            "The completed Stripe Checkout Session has no subscription.",
          );
        const completedSubscription = await stripe.subscriptions.retrieve(
          completedSubscriptionId,
        );
        if (!isExpectedSubscription(completedSubscription, priceId))
          throw new Error(
            "The completed Stripe subscription does not match the configured monthly plan.",
          );
        if (
          !["canceled", "incomplete_expired"].includes(
            completedSubscription.status,
          )
        ) {
          // Checkout has already created a subscription. Send the student to
          // webhook-backed status instead of risking a duplicate while the
          // signed confirmation is still being processed.
          redirect(
            `/subscription/return?returnTo=${encodeURIComponent(returnTo)}`,
          );
        }
      }

      // The stored Session is missing, expired, or belongs to a completed
      // terminal subscription. Rotate only the exact attempt token observed by
      // this request; the database CAS makes concurrent retries share one new
      // Stripe idempotency key rather than creating duplicate subscriptions.
      replaceCheckoutAttemptId = billing.checkout_attempt_id
        ? String(billing.checkout_attempt_id)
        : null;
    }

    const { data: checkoutAttempt, error: attemptError } =
      await serviceClient.rpc("claim_stripe_checkout_attempt", {
        target_user_id: profile.id,
        replace_attempt_id: replaceCheckoutAttemptId,
      });
    if (attemptError) throw attemptError;
    if (
      typeof checkoutAttempt !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        checkoutAttempt,
      )
    )
      throw new Error("Could not claim a Stripe Checkout attempt.");

    // Set the configured Price on the same claimed row before contacting
    // Stripe. If an extremely fast webhook beats Session recording, its signed
    // attempt metadata must match both this token and this server-set Price.
    const { data: claimedRow, error: claimedRowError } = await serviceClient
      .from("billing_subscriptions")
      .update({ price_id: priceId, currency: "usd", amount_minor: 10_000 })
      .eq("user_id", profile.id)
      .eq("checkout_attempt_id", checkoutAttempt)
      .select("user_id")
      .maybeSingle();
    if (claimedRowError) throw claimedRowError;
    if (!claimedRow)
      throw new Error("The Stripe Checkout attempt changed unexpectedly.");

    const metadata = {
      medinexus_user_id: profile.id,
      medinexus_plan: "student_monthly_100_usd",
      medinexus_checkout_attempt_id: checkoutAttempt,
    };
    // Provider parameters must be identical for every retry of the stable
    // attempt idempotency key. Keep these URLs independent of a form's
    // returnTo value; the status page safely defaults to the dashboard.
    const successUrl = new URL("/subscription/return", baseUrl);
    successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
    const cancelUrl = new URL("/subscribe", baseUrl);
    cancelUrl.searchParams.set("canceled", "1");

    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        client_reference_id: profile.id,
        line_items: [{ price: priceId, quantity: 1 }],
        billing_address_collection: "required",
        payment_method_collection: "always",
        success_url: successUrl.toString(),
        cancel_url: cancelUrl.toString(),
        metadata,
        // Copy the internal user ID onto the resulting Subscription so future
        // renewal invoice webhooks can reconcile it without trusting the URL.
        subscription_data: {
          description: "Magna-Q student monthly subscription",
          metadata,
        },
        ...(billing?.stripe_customer_id
          ? {
              customer: String(billing.stripe_customer_id),
              customer_update: { address: "auto", name: "auto" },
            }
          : { customer_email: user.email }),
      },
      {
        // The database-issued attempt is stable across concurrent form submits
        // and SDK retries. It rotates only after Stripe confirms the previous
        // Session is terminal, including requests straddling a clock boundary.
        idempotencyKey: `checkout:${profile.id}:${checkoutAttempt}`,
      },
    );

    // This CAS records only a reconciliation hint for the attempt that created
    // the Session. It cannot overwrite a newer concurrent attempt, and access
    // remains unpaid until the signature-verified webhook confirms payment.
    const { data: recorded, error: projectionError } = await serviceClient.rpc(
      "record_stripe_checkout_session",
      {
        target_user_id: profile.id,
        target_attempt_id: checkoutAttempt,
        target_session_id: session.id,
        target_customer_id: stripeId(session.customer),
        target_price_id: priceId,
      },
    );
    if (projectionError) throw projectionError;
    if (!recorded)
      throw new Error("A newer Stripe Checkout attempt replaced this Session.");

    // Record the ID even when an idempotent recovery returns a terminal Session
    // without a URL. The next request can then inspect it and CAS-rotate the
    // attempt instead of being permanently stuck on the old idempotency key.
    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");

    redirect(session.url);
  } catch (error) {
    // Next.js redirects are implemented as framework errors; rethrow them so
    // the successful external Checkout redirect is not mistaken for a failure.
    if (
      error instanceof Error &&
      (error as Error & { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
    )
      throw error;

    console.error("Stripe Checkout creation failed", {
      userId: profile.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    redirect(
      `/subscribe?returnTo=${encodeURIComponent(returnTo)}&error=${encodeURIComponent("We could not open secure checkout. Please try again or contact support.")}`,
    );
  }
}
