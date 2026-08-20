export type RecordedPaymentState = {
  status: string;
  stripeEventCreated: number | null;
};

/**
 * Webhook payloads are immutable snapshots and can arrive late. After fetching
 * the Invoice again from Stripe, only its current `paid` state can grant or
 * preserve access; an open, void, or uncollectible invoice is still unpaid.
 */
export function currentInvoicePaymentOutcome(
  currentInvoiceStatus: string | null,
): "paid" | "failed" {
  return currentInvoiceStatus === "paid" ? "paid" : "failed";
}

export function failedInvoiceShouldRevokeEntitlement({
  invoiceId,
  latestInvoiceId,
  subscriptionStatus,
}: {
  invoiceId: string;
  latestInvoiceId: string | null;
  subscriptionStatus: string;
}) {
  return invoiceId === latestInvoiceId || subscriptionStatus !== "active";
}

/**
 * Stripe events may arrive out of order. A paid invoice is terminal for this
 * audit row and must never be downgraded by a delayed payment-failed event.
 */
export function shouldApplyPaymentEvent(
  existing: RecordedPaymentState | null,
  incomingStatus: "paid" | "failed",
  incomingEventCreated: number,
) {
  if (!existing) return true;
  if (existing.status === "paid" && incomingStatus === "failed") return false;
  if (existing.status === "failed" && incomingStatus === "paid") return true;
  return (
    existing.stripeEventCreated == null ||
    incomingEventCreated >= existing.stripeEventCreated
  );
}
