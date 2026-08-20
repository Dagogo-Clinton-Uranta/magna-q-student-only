# Student subscriptions

The student portal uses Stripe-hosted Checkout for a fixed USD $100 monthly
subscription. A paid period unlocks practice tests, video interview practice,
and chat rooms.

Payments are disabled and student features are free by default. To restore the
gates, set `PAYMENTS_ENABLED=true`, enable the `payments` row in
`product_feature_flags`, and restart the application. The environment flag
restores page, API, socket, and Checkout gates; the database flag restores the
checks inside student RPCs.

Configure `STRIPE_SECRET_KEY`, `STRIPE_MONTHLY_PRICE_ID`,
`STRIPE_WEBHOOK_SECRET`, and `STRIPE_LIVE_MODE`. Register
`/api/stripe/webhook` for Checkout completion, invoice paid/failed, and
subscription updated/deleted events. The webhook also requires the server-only
`SUPABASE_SERVICE_ROLE_KEY`.

The Checkout return page is informational. Only a signature-verified webhook
can update billing state. Event and invoice identifiers are unique so retries
remain idempotent.

Before launch, verify successful Checkout, duplicate-event replay, failed and
deleted subscriptions, all paid-feature gates, and that one student cannot read
another student's billing records.
