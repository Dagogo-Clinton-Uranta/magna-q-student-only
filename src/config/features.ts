/**
 * Product access is free by default while Magna-Q grows its audience.
 * Set PAYMENTS_ENABLED=true to restore Stripe checkout and entitlement checks.
 */
export const PAYMENTS_ENABLED = process.env.PAYMENTS_ENABLED === "true";
