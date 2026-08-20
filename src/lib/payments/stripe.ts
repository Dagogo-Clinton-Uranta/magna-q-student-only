import "server-only";

import Stripe from "stripe";
import {
  parseStripeLiveMode,
  stripeModeMatches,
} from "@/lib/payments/stripe-mode";

/** The subscription price promised in the product UI, stored in minor units. */
export const MONTHLY_SUBSCRIPTION_AMOUNT_MINOR = 10_000;
export const MONTHLY_SUBSCRIPTION_CURRENCY = "usd";

function requiredStripeEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(
      `${name} is required. Add it to your server environment before enabling Stripe billing.`,
    );
  return value;
}

/**
 * Reads the recurring Price created in Stripe Dashboard. Keep the dollar amount
 * in Stripe rather than accepting one from the browser; this prevents a student
 * from changing the price submitted to Checkout.
 */
export function getStripeMonthlyPriceId() {
  return requiredStripeEnvironment("STRIPE_MONTHLY_PRICE_ID");
}

/**
 * Stripe uses this endpoint-specific secret to prove that a webhook request
 * really came from Stripe. It is different from STRIPE_SECRET_KEY.
 */
export function getStripeWebhookSecret() {
  return requiredStripeEnvironment("STRIPE_WEBHOOK_SECRET");
}

export function getStripeLiveMode() {
  return parseStripeLiveMode(process.env.STRIPE_LIVE_MODE?.trim());
}

let stripeClient: Stripe | undefined;

/**
 * Returns one server-only Stripe SDK client. STRIPE_SECRET_KEY must never use a
 * NEXT_PUBLIC_ prefix or be imported by a Client Component.
 */
export function getStripe() {
  stripeClient ??= new Stripe(requiredStripeEnvironment("STRIPE_SECRET_KEY"), {
    // Pin the version bundled with stripe@22 so webhook and SDK types agree.
    apiVersion: "2026-07-29.dahlia",
    maxNetworkRetries: 2,
    typescript: true,
    appInfo: { name: "Magna-Q", version: "0.1.0" },
  });
  return stripeClient;
}

/**
 * Refuse to create or honor Checkout for a Dashboard Price that no longer
 * represents exactly $100 USD every month. This is a second line of defense
 * against a copied or accidentally reconfigured STRIPE_MONTHLY_PRICE_ID.
 */
export async function verifyMonthlyStripePrice(stripe = getStripe()) {
  const expectedPriceId = getStripeMonthlyPriceId();
  const price = await stripe.prices.retrieve(expectedPriceId);
  const isExpectedPrice =
    !price.deleted &&
    stripeModeMatches(price.livemode, getStripeLiveMode()) &&
    price.active &&
    price.type === "recurring" &&
    price.billing_scheme === "per_unit" &&
    price.currency.toLowerCase() === MONTHLY_SUBSCRIPTION_CURRENCY &&
    price.unit_amount === MONTHLY_SUBSCRIPTION_AMOUNT_MINOR &&
    price.recurring?.interval === "month" &&
    price.recurring.interval_count === 1 &&
    price.recurring.usage_type === "licensed" &&
    price.transform_quantity == null;

  if (!isExpectedPrice)
    throw new Error(
      "STRIPE_MONTHLY_PRICE_ID must point to an active $100 USD monthly recurring Price.",
    );

  return price;
}
