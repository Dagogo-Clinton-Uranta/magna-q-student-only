/**
 * A Stripe customer can have historical subscriptions as well as the current
 * one. Customer ID alone must not let an event for an old subscription replace
 * another projection. A missing binding is safe to initialize. A legitimate
 * replacement is instead authorized by the exact Checkout Session stored by
 * our server action, after which the row is bound to the new Subscription ID.
 */
export function canBindSubscriptionThroughCustomer({
  incomingSubscriptionId,
  storedSubscriptionId,
}: {
  incomingSubscriptionId: string | null | undefined;
  storedSubscriptionId: string | null | undefined;
}) {
  return (
    !incomingSubscriptionId ||
    !storedSubscriptionId ||
    incomingSubscriptionId === storedSubscriptionId
  );
}
