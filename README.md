# MediNexus Africa

MediNexus Africa is the student-facing web application. It handles interview
recording uploads and enqueues BullMQ work; transcription, evaluation, and mock
finalization run only in the separately deployed Railway worker.

## Stack

- Next.js 15, React 19, TypeScript, and Tailwind CSS
- Supabase Auth and PostgreSQL
- Private Cloudflare R2 interview-video storage
- BullMQ over a shared native Redis connection
- Vitest, PostgreSQL integration tests, and Playwright

## Local setup

Requirements: Node.js 24, npm, Docker, and the Supabase CLI.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and supply local credentials.
3. Start Supabase with `npx supabase start`.
4. Rebuild the database with `npx supabase db reset`.
5. Start the web application with `npm run dev`.

## Interview worker connection

This repository is the queue producer, not the interview worker. Its normal
`npm start` command starts the web application and never starts an interview
BullMQ `Worker`.

Configure the Vercel application and Railway worker with the exact same native
`REDIS_URL` (`redis://` or `rediss://`). Do not use an Upstash REST URL. Both
deployments must also reference the same Supabase project and private R2 bucket.

The web application enqueues these ID-only contracts:

- `interview-transcription` with `{ id: answerId }`
- `interview-evaluation` with `{ id: answerId }`
- `mock-finalization` with `{ id: sessionId }`

The separately deployed Railway service must start with
`npm run worker:interviews`. It does not need a public domain, `WORKER_URL`, or
an HTTP health-check path. Its successful startup log is:

```text
Interview transcription, evaluation, and mock-finalization workers are ready.
```

See [the interview pipeline runbook](docs/interview-video-pipeline.md) for the
shared variables and smoke test.

## Verification

```bash
npm run typecheck
npm run format
npm test
npm run build
```

Never commit environment credentials. In particular,
`SUPABASE_SERVICE_ROLE_KEY`, Redis credentials, and R2 credentials are
server-only values and must never use a `NEXT_PUBLIC_` prefix.
