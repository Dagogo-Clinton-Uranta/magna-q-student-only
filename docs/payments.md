# Stripe payments

## Interview practice credits

Interview practice uses Stripe-hosted Checkout for two one-time USD purchases:

| Stripe product | Price type | Amount | Credit granted |
| --- | --- | ---: | --- |
| Magna-Q Competency Practice Pack | One-time | $10 USD | 10 individual competency videos and analyses |
| Magna-Q Mock Interview | One-time | $5 USD | 1 eight-question mock interview and its analysis |

Every student receives three competency videos and analyses free. The free
allowance and purchased balances are stored on `profiles`; purchases and credit
use also have dedicated audit records. Creating an individual upload reserves
one free or pack credit atomically. Creating a mock session reserves one mock
credit atomically; its eight answer videos do not consume more credits.

In Stripe Dashboard, create the two products above and add one active one-time
Price to each. Copy the `price_...` identifiers into:

```dotenv
STRIPE_INTERVIEW_COMPETENCY_PACK_PRICE_ID=price_...
STRIPE_INTERVIEW_MOCK_PRICE_ID=price_...
```

Do not use a Product ID (`prod_...`) or Payment Link. The server retrieves each
Price before Checkout and refuses it unless the mode, currency, and amount are
exactly as listed above.

Create a Stripe webhook destination at:

```text
https://YOUR-MAGNA-Q-DOMAIN/api/stripe/webhook
```

Subscribe it to these interview Checkout events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

Copy that endpoint's `whsec_...` signing secret into
`STRIPE_WEBHOOK_SECRET`. Checkout return pages are informational: only a
signature-verified paid event grants credits. Fulfillment locks the purchase
row and is idempotent across duplicate or concurrent Stripe deliveries.

Start with Stripe test mode and `STRIPE_LIVE_MODE=false`. Use test API keys,
test Price IDs, and the test endpoint signing secret together. At launch,
replace all four with their live-mode counterparts, set
`STRIPE_LIVE_MODE=true`, and redeploy. Stripe's test card documentation uses
`4242 4242 4242 4242` with any future expiry and any three-digit CVC for a
successful interactive payment. Never use a real card in test mode.

Stripe references:

- https://docs.stripe.com/payments/checkout/how-checkout-works
- https://docs.stripe.com/checkout/fulfillment
- https://docs.stripe.com/testing

## Student subscriptions

The student portal uses Stripe-hosted Checkout for a fixed USD $100 monthly
subscription. A paid period unlocks the features described on the subscription
screen. Interview video credits remain separate one-time purchases.

Payments are disabled and student features are free by default. To restore the
gates, set `PAYMENTS_ENABLED=true`, enable the `payments` row in
`product_feature_flags`, and restart the application. The environment flag
restores page, API, socket, and Checkout gates; the database flag restores the
checks inside student RPCs.

Configure `STRIPE_SECRET_KEY`, `STRIPE_MONTHLY_PRICE_ID`,
`STRIPE_WEBHOOK_SECRET`, and `STRIPE_LIVE_MODE`. The same webhook destination
must also subscribe to `invoice.paid`, `invoice.payment_failed`,
`customer.subscription.updated`, and `customer.subscription.deleted`. The
webhook requires the server-only `SUPABASE_SERVICE_ROLE_KEY`.

The Checkout return page is informational. Only a signature-verified webhook
can update billing state. Event and invoice identifiers are unique so retries
remain idempotent.

Before launch, verify successful Checkout, duplicate-event replay, failed and
deleted subscriptions, all paid-feature gates, and that one student cannot read
another student's billing records.
