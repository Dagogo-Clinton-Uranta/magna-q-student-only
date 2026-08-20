import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  currentInvoicePaymentOutcome,
  failedInvoiceShouldRevokeEntitlement,
  shouldApplyPaymentEvent,
} from "@/lib/payments/payment-order";
import { normalizePaymentIdentitySnapshot } from "@/lib/payments/payment-snapshot";
import { canBindSubscriptionThroughCustomer } from "@/lib/payments/subscription-reconciliation";
import { stripeModeMatches } from "@/lib/payments/stripe-mode";
import {
  getStripe,
  getStripeLiveMode,
  getStripeMonthlyPriceId,
  MONTHLY_SUBSCRIPTION_AMOUNT_MINOR,
  MONTHLY_SUBSCRIPTION_CURRENCY,
} from "@/lib/payments/stripe";

type AdminClient = SupabaseClient;

type LocalStudent = {
  id: string;
  fullName: string;
  email: string;
};

type ReconciliationIds = {
  checkoutSessionId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
};

type BillingOwner = {
  user_id: string;
  price_id: string;
  stripe_subscription_id: string | null;
  status: string;
};

export type WebhookProcessingResult = {
  duplicate?: boolean;
  handled: boolean;
  ignoredReason?: string;
};

function asId(value: { id: string } | string | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function asIsoTime(unixSeconds: number | null | undefined) {
  return unixSeconds == null
    ? null
    : new Date(unixSeconds * 1_000).toISOString();
}

function isUuid(value: string | null | undefined) {
  return Boolean(
    value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    ),
  );
}

function eventObjectId(event: Stripe.Event) {
  const object = event.data.object as { id?: unknown };
  return typeof object.id === "string" ? object.id : null;
}

/**
 * Saves only operational identifiers from a Stripe event. Full event objects
 * can contain customer details and are intentionally not copied into Postgres.
 */
function minimalEventPayload(event: Stripe.Event) {
  return {
    livemode: event.livemode,
    object: event.data.object.object,
    request_id: event.request?.id ?? null,
  };
}

async function registerWebhookEvent(
  admin: AdminClient,
  event: Stripe.Event,
): Promise<"new" | "duplicate"> {
  const { error } = await admin.from("stripe_webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    stripe_object_id: eventObjectId(event),
    event_created_at: asIsoTime(event.created),
    payload: minimalEventPayload(event),
  });
  if (!error) return "new";
  if (error.code !== "23505") throw error;

  const { data: previous, error: lookupError } = await admin
    .from("stripe_webhook_events")
    .select("processed_at,processing_error,created_at")
    .eq("stripe_event_id", event.id)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (previous?.processed_at) return "duplicate";

  if (previous?.processing_error) {
    // Atomically reclaim a previously failed event. Matching both the old
    // timestamp and error lets only one of several simultaneous retries win.
    const claimedAt = new Date().toISOString();
    const { data: reclaimed, error: retryError } = await admin
      .from("stripe_webhook_events")
      .update({ created_at: claimedAt, processing_error: null })
      .eq("stripe_event_id", event.id)
      .eq("created_at", String(previous.created_at))
      .eq("processing_error", String(previous.processing_error))
      .is("processed_at", null)
      .select("stripe_event_id")
      .maybeSingle();
    if (retryError) throw retryError;
    if (reclaimed) return "new";
  }

  const priorClaimCreatedAt = previous?.created_at
    ? String(previous.created_at)
    : null;
  const createdAt = priorClaimCreatedAt
    ? Date.parse(priorClaimCreatedAt)
    : Number.NaN;
  if (Number.isFinite(createdAt) && createdAt < Date.now() - 5 * 60 * 1_000) {
    // A prior process may have died after claiming the event but before it
    // could record success or failure. Refreshing created_at reclaims a stale
    // claim while the conditional timestamp prevents two retries taking it.
    const claimedAt = new Date().toISOString();
    const { data: reclaimed, error: reclaimError } = await admin
      .from("stripe_webhook_events")
      .update({ created_at: claimedAt, processing_error: null })
      .eq("stripe_event_id", event.id)
      .eq("created_at", priorClaimCreatedAt as string)
      .is("processed_at", null)
      .select("stripe_event_id")
      .maybeSingle();
    if (reclaimError) throw reclaimError;
    if (reclaimed) return "new";
  }

  // Another request is currently handling the same event. Returning an error
  // asks Stripe to retry rather than falsely acknowledging unfinished work.
  throw new Error(`Stripe event ${event.id} is already being processed.`);
}

async function finishWebhookEvent(
  admin: AdminClient,
  eventId: string,
  processingError?: string,
) {
  const values = processingError
    ? { processing_error: processingError.slice(0, 1_000) }
    : { processed_at: new Date().toISOString(), processing_error: null };
  const { error } = await admin
    .from("stripe_webhook_events")
    .update(values)
    .eq("stripe_event_id", eventId);
  if (error) throw error;
}

function expectedSubscriptionItem(subscription: Stripe.Subscription) {
  const expectedPriceId = getStripeMonthlyPriceId();
  if (subscription.items.data.length !== 1) return null;
  const item = subscription.items.data[0];
  const price = item?.price;
  if (
    !item ||
    !price ||
    price.id !== expectedPriceId ||
    item.quantity !== 1 ||
    price.billing_scheme !== "per_unit" ||
    price.currency.toLowerCase() !== MONTHLY_SUBSCRIPTION_CURRENCY ||
    price.unit_amount !== MONTHLY_SUBSCRIPTION_AMOUNT_MINOR ||
    price.recurring?.interval !== "month" ||
    price.recurring.interval_count !== 1 ||
    price.recurring.usage_type !== "licensed" ||
    price.transform_quantity != null
  )
    return null;
  return item;
}

async function billingRowByProviderIds(
  admin: AdminClient,
  ids: ReconciliationIds,
) {
  // Exact subscription and Checkout bindings are stronger than a customer
  // match because one customer can own several historical subscriptions.
  const exactLookups: Array<[string, string | null | undefined]> = [
    ["stripe_subscription_id", ids.subscriptionId],
    ["last_checkout_session_id", ids.checkoutSessionId],
  ];
  for (const [column, value] of exactLookups) {
    if (!value) continue;
    const { data, error } = await admin
      .from("billing_subscriptions")
      .select("user_id,price_id,stripe_subscription_id,status")
      .eq(column, value)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as BillingOwner;
  }

  if (!ids.customerId) return null;
  const { data, error } = await admin
    .from("billing_subscriptions")
    .select("user_id,price_id,stripe_subscription_id,status")
    .eq("stripe_customer_id", ids.customerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  if (
    !canBindSubscriptionThroughCustomer({
      incomingSubscriptionId: ids.subscriptionId,
      storedSubscriptionId: data.stripe_subscription_id as string | null,
    })
  )
    return null;
  return data as BillingOwner;
}

/**
 * Metadata is useful for reconciliation, but it is never sufficient by itself.
 * It must match the unguessable Checkout attempt stored by our authenticated
 * action, or a provider ID already bound to that same billing row.
 */
async function resolveBillingOwner(
  admin: AdminClient,
  candidateUserId: string | null | undefined,
  candidateCheckoutAttemptId: string | null | undefined,
  ids: ReconciliationIds,
) {
  const expectedPriceId = getStripeMonthlyPriceId();
  let billing = await billingRowByProviderIds(admin, ids);

  if (
    !billing &&
    isUuid(candidateUserId) &&
    isUuid(candidateCheckoutAttemptId)
  ) {
    const result = await admin
      .from("billing_subscriptions")
      .select("user_id,price_id,stripe_subscription_id,status")
      .eq("user_id", candidateUserId as string)
      .eq("price_id", expectedPriceId)
      .eq("checkout_attempt_id", candidateCheckoutAttemptId as string)
      .maybeSingle();
    if (result.error) throw result.error;
    billing = result.data as BillingOwner | null;
  }

  if (!billing || billing.price_id !== expectedPriceId) return null;
  if (candidateUserId && billing.user_id !== candidateUserId) {
    console.warn("Stripe metadata did not match the stored billing owner", {
      storedUserId: billing.user_id,
    });
  }
  return billing;
}

async function loadStudent(
  admin: AdminClient,
  userId: string,
): Promise<LocalStudent | null> {
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id,full_name,role")
    .eq("id", userId)
    .eq("role", "student")
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) return null;

  const { data: authData, error: authError } =
    await admin.auth.admin.getUserById(userId);
  if (authError) throw authError;
  if (!authData.user?.email) return null;

  return {
    id: String(profile.id),
    fullName: String(profile.full_name),
    email: authData.user.email,
  };
}

function subscriptionCandidateUserId(subscription: Stripe.Subscription) {
  return subscription.metadata.medinexus_user_id ?? null;
}

function subscriptionCandidateAttemptId(subscription: Stripe.Subscription) {
  return subscription.metadata.medinexus_checkout_attempt_id ?? null;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice) {
  return asId(invoice.parent?.subscription_details?.subscription);
}

function invoiceCandidateUserId(invoice: Stripe.Invoice) {
  return (
    invoice.parent?.subscription_details?.metadata?.medinexus_user_id ??
    invoice.metadata?.medinexus_user_id ??
    null
  );
}

function invoiceCandidateAttemptId(invoice: Stripe.Invoice) {
  return (
    invoice.parent?.subscription_details?.metadata
      ?.medinexus_checkout_attempt_id ??
    invoice.metadata?.medinexus_checkout_attempt_id ??
    null
  );
}

async function retrieveExpectedSubscription(subscriptionId: string | null) {
  if (!subscriptionId) return null;
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  return expectedSubscriptionItem(subscription) ? subscription : null;
}

async function claimBillingSync(admin: AdminClient, userId: string) {
  const { data, error } = await admin.rpc("claim_stripe_billing_sync", {
    target_user_id: userId,
  });
  if (error) throw error;
  if (!isUuid(typeof data === "string" ? data : null))
    throw new Error("Stripe billing synchronization is busy; retry the event.");
  return data as string;
}

async function releaseBillingSync(
  admin: AdminClient,
  userId: string,
  leaseId: string,
) {
  const { error } = await admin.rpc("release_stripe_billing_sync", {
    target_user_id: userId,
    target_lease_id: leaseId,
  });
  if (error) throw error;
}

async function syncSubscriptionProjection({
  admin,
  event,
  student,
  subscription,
  syncLeaseId,
  checkoutSessionId,
  forceUnpaid = false,
}: {
  admin: AdminClient;
  event: Stripe.Event;
  student: LocalStudent;
  subscription: Stripe.Subscription;
  syncLeaseId: string;
  checkoutSessionId?: string | null;
  forceUnpaid?: boolean;
}) {
  const item = expectedSubscriptionItem(subscription);
  if (!item) return false;
  const currentPeriodStart = asIsoTime(item.current_period_start);
  const currentPeriodEnd = asIsoTime(item.current_period_end);
  const accessIsCurrent =
    !forceUnpaid &&
    subscription.status === "active" &&
    Boolean(currentPeriodStart) &&
    Date.parse(currentPeriodStart as string) <= Date.now() &&
    Boolean(currentPeriodEnd) &&
    Date.parse(currentPeriodEnd as string) > Date.now();

  const { data: applied, error: projectionError } = await admin.rpc(
    "apply_stripe_subscription_event",
    {
      target_user_id: student.id,
      target_stripe_customer_id: asId(subscription.customer),
      target_stripe_subscription_id: subscription.id,
      target_price_id: item.price.id,
      // A failed payment revokes entitlement even if Stripe retrieval briefly
      // returns the preceding active subscription status.
      target_status:
        forceUnpaid && subscription.status === "active"
          ? "past_due"
          : subscription.status,
      target_currency: item.price.currency.toLowerCase(),
      target_amount_minor: item.price.unit_amount,
      target_period_start: currentPeriodStart,
      target_period_end: currentPeriodEnd,
      target_cancel_at_period_end: subscription.cancel_at_period_end,
      target_canceled_at: asIsoTime(subscription.canceled_at),
      target_checkout_session_id: checkoutSessionId ?? null,
      target_event_created_at: asIsoTime(event.created),
      target_event_id: event.id,
      target_sync_lease_id: syncLeaseId,
    },
  );
  if (projectionError) throw projectionError;
  return Boolean(applied) && accessIsCurrent;
}

async function paymentMethodSnapshot(invoice: Stripe.Invoice) {
  const stripe = getStripe();
  const invoicePayments = await stripe.invoicePayments.list({
    invoice: invoice.id,
    limit: 10,
    expand: ["data.payment.payment_intent.latest_charge"],
  });
  const invoicePayment =
    invoicePayments.data.find((candidate) => candidate.status === "paid") ??
    invoicePayments.data[0];
  if (!invoicePayment) return {};

  let paymentIntentId: string | null = null;
  let charge: Stripe.Charge | null = null;
  const paymentIntent = invoicePayment.payment.payment_intent;
  if (typeof paymentIntent === "string") {
    paymentIntentId = paymentIntent;
    const expanded = await stripe.paymentIntents.retrieve(paymentIntent, {
      expand: ["latest_charge"],
    });
    if (expanded.latest_charge && typeof expanded.latest_charge !== "string")
      charge = expanded.latest_charge;
  } else if (paymentIntent) {
    paymentIntentId = paymentIntent.id;
    if (
      paymentIntent.latest_charge &&
      typeof paymentIntent.latest_charge !== "string"
    )
      charge = paymentIntent.latest_charge;
  }

  const directCharge = invoicePayment.payment.charge;
  if (!charge && directCharge) {
    charge =
      typeof directCharge === "string"
        ? await stripe.charges.retrieve(directCharge)
        : directCharge;
  }
  const card = charge?.payment_method_details?.card;
  return {
    stripe_payment_intent_id: paymentIntentId,
    stripe_charge_id: charge?.id ?? null,
    card_brand: card?.brand ?? null,
    card_last4: card?.last4 ?? null,
  };
}

async function saveInvoicePayment({
  admin,
  event,
  invoice,
  subscription,
  student,
  checkoutSessionId,
  status,
}: {
  admin: AdminClient;
  event: Stripe.Event;
  invoice: Stripe.Invoice;
  subscription: Stripe.Subscription;
  student: LocalStudent;
  checkoutSessionId?: string | null;
  status: "paid" | "failed";
}) {
  const paymentMethod = await paymentMethodSnapshot(invoice);
  const discountMinor = (invoice.total_discount_amounts ?? []).reduce(
    (total, discount) => total + discount.amount,
    0,
  );
  const taxMinor = (invoice.total_taxes ?? []).reduce(
    (total, tax) => total + tax.amount,
    0,
  );
  const paidAt =
    status === "paid"
      ? (asIsoTime(invoice.status_transitions.paid_at) ??
        asIsoTime(event.created))
      : null;
  const identity = normalizePaymentIdentitySnapshot({
    providerName: invoice.customer_name,
    providerEmail: invoice.customer_email,
    trustedName: student.fullName,
    trustedEmail: student.email,
  });
  const paymentRow: Record<string, unknown> = {
    user_id: student.id,
    user_name_snapshot: identity.name,
    user_email_snapshot: identity.email,
    amount_subtotal_minor: invoice.subtotal,
    discount_minor: discountMinor,
    tax_minor: taxMinor,
    amount_total_minor: invoice.total,
    amount_paid_minor: invoice.amount_paid,
    currency: invoice.currency.toLowerCase(),
    status,
    stripe_invoice_id: invoice.id,
    stripe_customer_id: asId(invoice.customer) ?? asId(subscription.customer),
    stripe_subscription_id: subscription.id,
    invoice_number: invoice.number,
    invoice_url: invoice.hosted_invoice_url ?? null,
    invoice_pdf_url: invoice.invoice_pdf ?? null,
    paid_at: paidAt,
    period_start: asIsoTime(invoice.period_start),
    period_end: asIsoTime(invoice.period_end),
    metadata: {
      stripe_event_type: event.type,
      stripe_event_created: event.created,
      billing_reason: invoice.billing_reason,
      attempt_count: invoice.attempt_count,
    },
    ...paymentMethod,
  };
  if (checkoutSessionId)
    paymentRow.stripe_checkout_session_id = checkoutSessionId;

  const { data: existing, error: lookupError } = await admin
    .from("payments")
    .select("status,metadata")
    .eq("stripe_invoice_id", invoice.id)
    .maybeSingle();
  if (lookupError) throw lookupError;
  const existingMetadata =
    existing?.metadata &&
    typeof existing.metadata === "object" &&
    !Array.isArray(existing.metadata)
      ? (existing.metadata as Record<string, unknown>)
      : null;
  const recordedEventCreated = existingMetadata?.stripe_event_created;
  if (
    !shouldApplyPaymentEvent(
      existing
        ? {
            status: String(existing.status),
            stripeEventCreated:
              typeof recordedEventCreated === "number"
                ? recordedEventCreated
                : null,
          }
        : null,
      status,
      event.created,
    )
  )
    return;

  if (!existing) {
    const { error: insertError } = await admin
      .from("payments")
      .insert(paymentRow);
    if (!insertError) return;
    if (insertError.code !== "23505") throw insertError;
    // A competing webhook inserted this invoice between our read and insert.
    // Continue into a conditional update so paid status still wins the race.
  }

  let update = admin
    .from("payments")
    .update(paymentRow)
    .eq("stripe_invoice_id", invoice.id);
  if (status === "failed") {
    // This database predicate closes the concurrency gap between the read above
    // and the write: even simultaneous events cannot replace paid with failed.
    update = update.neq("status", "paid");
  }
  const { error: updateError } = await update;
  if (updateError) throw updateError;
}

async function processCheckoutCompleted(
  admin: AdminClient,
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  student: LocalStudent,
  syncLeaseId: string,
): Promise<WebhookProcessingResult> {
  if (session.mode !== "subscription")
    return { handled: false, ignoredReason: "not_subscription_checkout" };

  const subscription = await retrieveExpectedSubscription(
    asId(session.subscription),
  );
  if (!subscription)
    return { handled: false, ignoredReason: "unexpected_subscription_price" };
  await syncSubscriptionProjection({
    admin,
    event,
    student,
    subscription,
    syncLeaseId,
    checkoutSessionId: session.id,
    forceUnpaid: session.payment_status !== "paid",
  });

  // The invoice.paid event normally writes this snapshot. Processing the
  // Checkout invoice too makes initial-payment recording resilient to webhook
  // endpoint event-selection mistakes; the unique invoice ID keeps it safe.
  if (session.payment_status === "paid" && session.invoice) {
    const invoice = await getStripe().invoices.retrieve(
      asId(session.invoice) as string,
    );
    await saveInvoicePayment({
      admin,
      event,
      invoice,
      subscription,
      student,
      checkoutSessionId: session.id,
      status: "paid",
    });
  }
  return { handled: true };
}

async function processInvoice(
  admin: AdminClient,
  event: Stripe.Event,
  invoice: Stripe.Invoice,
  student: LocalStudent,
  syncLeaseId: string,
): Promise<WebhookProcessingResult> {
  // The signed event proves provenance, but its object is a historical
  // snapshot. Re-reading the Invoice means a delayed payment_failed event
  // cannot revoke access after that same invoice has since become paid.
  const status = currentInvoicePaymentOutcome(invoice.status);
  const subscription = await retrieveExpectedSubscription(
    invoiceSubscriptionId(invoice),
  );
  if (!subscription)
    return { handled: false, ignoredReason: "unexpected_subscription_price" };
  await syncSubscriptionProjection({
    admin,
    event,
    student,
    subscription,
    syncLeaseId,
    forceUnpaid:
      status === "failed" &&
      failedInvoiceShouldRevokeEntitlement({
        invoiceId: invoice.id,
        latestInvoiceId: asId(subscription.latest_invoice),
        subscriptionStatus: subscription.status,
      }),
  });
  await saveInvoicePayment({
    admin,
    event,
    invoice,
    subscription,
    student,
    status,
  });
  return { handled: true };
}

async function processSubscriptionChange(
  admin: AdminClient,
  event: Stripe.Event,
  subscription: Stripe.Subscription,
  student: LocalStudent,
  syncLeaseId: string,
): Promise<WebhookProcessingResult> {
  if (!expectedSubscriptionItem(subscription))
    return { handled: false, ignoredReason: "unexpected_subscription_price" };
  await syncSubscriptionProjection({
    admin,
    event,
    student,
    subscription,
    syncLeaseId,
  });
  return { handled: true };
}

/**
 * Applies one signature-verified Stripe event idempotently. The browser return
 * page never calls this function and never grants access; only Stripe webhooks
 * update profiles.monthly_payment and the billing projection.
 */
export async function processStripeWebhookEvent(
  event: Stripe.Event,
): Promise<WebhookProcessingResult> {
  if (!stripeModeMatches(event.livemode, getStripeLiveMode()))
    throw new Error(
      "Stripe webhook live/test mode does not match STRIPE_LIVE_MODE.",
    );
  const admin = createServiceRoleClient();
  if ((await registerWebhookEvent(admin, event)) === "duplicate")
    return { duplicate: true, handled: true };

  try {
    let result: WebhookProcessingResult;
    switch (event.type) {
      case "checkout.session.completed": {
        const eventSession = event.data.object;
        const owner = await resolveBillingOwner(
          admin,
          eventSession.metadata?.medinexus_user_id ??
            eventSession.client_reference_id,
          eventSession.metadata?.medinexus_checkout_attempt_id,
          {
            checkoutSessionId: eventSession.id,
            customerId: asId(eventSession.customer),
            subscriptionId: asId(eventSession.subscription),
          },
        );
        if (!owner) {
          result = { handled: false, ignoredReason: "student_not_reconciled" };
          break;
        }
        const leaseId = await claimBillingSync(admin, owner.user_id);
        try {
          const session = await getStripe().checkout.sessions.retrieve(
            eventSession.id,
          );
          const subscription = await retrieveExpectedSubscription(
            asId(session.subscription),
          );
          if (!subscription) {
            result = {
              handled: false,
              ignoredReason: "unexpected_subscription_price",
            };
            break;
          }
          const student = await loadStudent(admin, owner.user_id);
          if (!student) {
            result = {
              handled: false,
              ignoredReason: "student_not_reconciled",
            };
            break;
          }
          result = await processCheckoutCompleted(
            admin,
            event,
            session,
            student,
            leaseId,
          );
        } finally {
          await releaseBillingSync(admin, owner.user_id, leaseId);
        }
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const eventInvoice = event.data.object;
        const eventSubscriptionId = invoiceSubscriptionId(eventInvoice);
        const owner = await resolveBillingOwner(
          admin,
          invoiceCandidateUserId(eventInvoice),
          invoiceCandidateAttemptId(eventInvoice),
          {
            customerId: asId(eventInvoice.customer),
            subscriptionId: eventSubscriptionId,
          },
        );
        if (!owner) {
          result = { handled: false, ignoredReason: "student_not_reconciled" };
          break;
        }
        const leaseId = await claimBillingSync(admin, owner.user_id);
        try {
          const invoice = await getStripe().invoices.retrieve(eventInvoice.id);
          const subscription = await retrieveExpectedSubscription(
            invoiceSubscriptionId(invoice),
          );
          if (!subscription) {
            result = {
              handled: false,
              ignoredReason: "unexpected_subscription_price",
            };
            break;
          }
          const student = await loadStudent(admin, owner.user_id);
          if (!student) {
            result = {
              handled: false,
              ignoredReason: "student_not_reconciled",
            };
            break;
          }
          result = await processInvoice(
            admin,
            event,
            invoice,
            student,
            leaseId,
          );
        } finally {
          await releaseBillingSync(admin, owner.user_id, leaseId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const eventSubscription = event.data.object;
        const owner = await resolveBillingOwner(
          admin,
          subscriptionCandidateUserId(eventSubscription),
          subscriptionCandidateAttemptId(eventSubscription),
          {
            customerId: asId(eventSubscription.customer),
            subscriptionId: eventSubscription.id,
          },
        );
        if (!owner) {
          result = { handled: false, ignoredReason: "student_not_reconciled" };
          break;
        }
        const leaseId = await claimBillingSync(admin, owner.user_id);
        try {
          const subscription = await getStripe().subscriptions.retrieve(
            eventSubscription.id,
          );
          if (!expectedSubscriptionItem(subscription)) {
            result = {
              handled: false,
              ignoredReason: "unexpected_subscription_price",
            };
            break;
          }
          const student = await loadStudent(admin, owner.user_id);
          if (!student) {
            result = {
              handled: false,
              ignoredReason: "student_not_reconciled",
            };
            break;
          }
          result = await processSubscriptionChange(
            admin,
            event,
            subscription,
            student,
            leaseId,
          );
        } finally {
          await releaseBillingSync(admin, owner.user_id, leaseId);
        }
        break;
      }
      default:
        result = { handled: false, ignoredReason: "unsupported_event" };
    }
    await finishWebhookEvent(admin, event.id);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    try {
      await finishWebhookEvent(admin, event.id, message);
    } catch (recordingError) {
      console.error("Could not record Stripe webhook processing failure", {
        eventId: event.id,
        error:
          recordingError instanceof Error
            ? recordingError.message
            : "Unknown error",
      });
    }
    throw error;
  }
}
