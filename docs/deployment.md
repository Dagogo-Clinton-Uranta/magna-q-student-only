# Deployment

1. Create a Supabase project, link it with `npx supabase link --project-ref <ref>`, and apply the ordered migrations with `npx supabase db push`.
2. Configure Auth site and callback URLs from `docs/authentication.md`.
3. Set browser-safe and server-only environment variables from `.env.example` in Vercel.
4. Deploy the Next.js application with Node.js 24.
5. Confirm the separate administration module points to the same shared data stores so pending student actions can be reviewed.
6. Run health, authentication, RLS, block-generation and answer smoke tests after deployment.

Before enabling paid features, follow [student subscriptions](payments.md): apply the billing migration, configure the fixed Stripe Price and signed webhook, and run the payment replay/paywall smoke checks.

Use the Supabase transaction pooler for serverless workloads. Never share-cache authenticated Route Handler responses.

## Vercel

The production default in `.env.production` sets `NEXT_PUBLIC_APP_URL` to `https://medi-nexus-africa.vercel.app`. Set the Supabase URL and anon key as browser-safe values, and add the service-role key only as a server secret. Select Node.js 24, deploy, and add production and preview callback origins to Supabase Auth. Access-control preview deployments if they use real project credentials.

### Vercel WebSocket chat

The authenticated chat endpoint is a Vercel Node WebSocket Function at
`/api/chat/socket`. In the Vercel project dashboard:

1. Open **Settings → Functions** and enable **Fluid Compute**. It is enabled by
   default for newer projects, but confirm it before redeploying.
2. Open **Settings → Environment Variables** and add `MONGODB_URI`,
   `MONGODB_DB_NAME`, the native `rediss://` `REDIS_URL`,
   `CHAT_SOCKET_AUTH_TTL_SECONDS`, and `OPENAI_API_KEY` to Production and any
   Preview environment that should support chat. Never use the Upstash REST URL
   for `REDIS_URL`.
3. Keep `PAYMENTS_ENABLED=false` while access is free. If it is enabled, also
   provide `SUPABASE_SERVICE_ROLE_KEY` and complete the Stripe subscription
   configuration because WebSocket joins fail closed without current billing.
4. Choose a Function region close to both MongoDB Atlas and Upstash to reduce
   join and relay latency, then redeploy after saving the variables.

No `vercel.json` rewrite is required: Next.js deploys
`src/app/api/chat/socket/route.ts` at the same path used by the browser. Vercel
WebSocket Functions close at their configured maximum duration; the client
reconnects and rejoins automatically. MongoDB is the durable history, while a
bounded Redis stream relays new messages across Function instances.

For local development, `npm run dev` uses the same raw-WebSocket protocol on
the custom Node server. To exercise Vercel's injected upgrade handler locally,
install the current Vercel CLI and run `vercel dev`.

## Post-deploy checks

Verify login/callback, onboarding, one tutor block, one timed block, signed image expiry, error reporting, and that a student cannot query another student's blocks or correctness data. Submit a private-group request and confirm it remains pending and is visible to the separate administration module. Open chat in two separate browsers, confirm both receive the same new message, and confirm the document appears in MongoDB `chatmessages`. Check rate-limit rows and server logs after the smoke run.
