# MediNexus Africa

MediNexus Africa is a mobile-first student portal for international medical graduates. It includes email-and-password student access and onboarding, tutor and timed blocks, results analytics, study utilities, interview practice, error reporting, and chat rooms.

## Stack

- Next.js 15, React 19, TypeScript and Tailwind CSS
- Supabase Auth, PostgreSQL with row-level security, and private Storage
- Vitest, PostgreSQL integration tests and Playwright
- Vercel-compatible deployment and GitHub Actions CI

## Local setup

Requirements: Node.js 24, npm, Docker, and the Supabase CLI.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`. Keep all local credentials in ignored
   environment files; `.env.production` contains only non-secret deployed
   defaults. An explicit value in `.env.local` overrides those defaults.
3. Start Supabase with `npx supabase start` and copy its URL, anon key and service-role key into `.env.local`.
4. Rebuild the database with `npx supabase db reset`. Migrations run in filename order and seed reference taxonomy plus 30 illustrative practice questions for each supported exam.
5. Start Next.js with `npm run dev`, then open the development `NEXT_PUBLIC_APP_URL` (`http://localhost:3000` by default).

Optional demo mode is enabled only when `DEMO_AUTH_BYPASS=true`. It hides the
email/password forms and opens a student demo session directly.
Keep it `false` in every environment connected to real users, data, or billing.

Authentication uses Supabase email and password accounts. Add the development and production confirmation callback URLs to Supabase's allowed redirect URLs; see [authentication](docs/authentication.md). Students finish `/onboarding` after registration. This portal does not expose staff registration or staff login.

The three premium student features use a fixed $100/month Stripe subscription,
and payment-dispute email uses Amazon SES. Provider setup, required webhook
events, environment variables, and launch checks are documented in
[payments](docs/payments.md).

## Separate administration module

Staff authoring and review screens live in the separate administration
codebase. This student portal still writes shared approval contracts: for
example, private chat groups remain pending until that module approves them.
Do not replace pending states with client-side approval or expose staff routes
from this application.

## Verification

```bash
npm run typecheck
npm run lint
npm run format
npm test
npm run test:integration
npm run test:db
npm run build
npm run test:e2e
```

`test:db` creates an isolated PostgreSQL cluster and verifies the migration/RPC chain. A running local Supabase stack is still needed for Auth, private Storage and the complete authenticated browser suite. See [testing](docs/testing.md) and the environment-specific [snag log](docs/snags.md).

## Operations and security

Never expose `SUPABASE_SERVICE_ROLE_KEY` or put it in a `NEXT_PUBLIC_` variable. Private question assets use short-lived signed URLs, answer correctness is released according to block mode, RPC mutations validate ownership, and RLS remains the final data boundary. Deployment, database, threat assumptions, load testing and the offline roadmap live in [`docs/`](docs/).

AI question assistance is optional and provider-isolated. Configure
`AI_PROVIDER`, a server-only provider key such as `OPENAI_API_KEY`, and the
provider model in the deployment environment. Without a key, the player shows a
clear disabled-state response and all non-AI study functionality remains
available.

## Chat rooms

Chat rooms use a native WebSocket endpoint at `/api/chat/socket`, deployed as a
Vercel WebSocket Function and served locally by the custom Node server. MongoDB
stores rooms, private-group requests and membership, notifications, messages,
and bans. PostgreSQL stores the globally unique profile username used for
private-group invitations. Redis is required: the verified chat page
stores a short-lived, opaque authentication ticket there, BullMQ stores
moderation jobs, and a bounded Redis stream relays live events across Vercel
Function instances. Connections resolve the ticket from Redis and revalidate
the current paid subscription against Supabase at join/send and periodic audit
boundaries. Configure the native `rediss://` `REDIS_URL` and optionally
`CHAT_SOCKET_AUTH_TTL_SECONDS` (one hour by default). After creating a MongoDB
database, add `MONGODB_URI` and optionally `MONGODB_DB_NAME`, then run:

```bash
npm run migrate:chat
```

This creates private-group and notification indexes and seeds USMLE-1,
USMLE-2, USMLE-3 and RESIDENCY-INTERVIEWS. Apply the Supabase migrations too so
registration username checks and exact username/email invitations are
available. Configure `OPENAI_API_KEY` to activate durable high-risk
moderation on the same Redis deployment. Each active WebSocket Function starts
a BullMQ worker; a separately hosted worker can also use `npm run worker:chat`.
Vercel Function connections have a bounded lifetime, so the browser reconnects
with exponential backoff and rejoins its selected room automatically.
