# Interview video pipeline

The app uses private Cloudflare R2 object storage for every individual and mock-interview recording. Browser uploads go directly to R2 with short-lived, content-type-bound presigned PUT URLs, so video bytes never pass through the Vercel Function request-body limit.

## Required server-only configuration

```bash
DEEPGRAM_API_KEY=
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_INTERVIEW_EVALUATION_MODEL=gpt-5.6-luna

REDIS_URL=
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=magna-q-interview-videos
# Optional; normally derived as https://<ACCOUNT_ID>.r2.cloudflarestorage.com
CLOUDFLARE_R2_ENDPOINT=

INTERVIEW_VIDEO_MAX_BYTES=52428800
INTERVIEW_VIDEO_RETENTION_HOURS=24
INTERVIEW_JOB_MAX_ATTEMPTS=5
INTERVIEW_JOB_BACKOFF_MS=5000
INTERVIEW_RECOVERY_INTERVAL_MS=30000
INTERVIEW_TRANSCRIPTION_CONCURRENCY=3
INTERVIEW_EVALUATION_CONCURRENCY=2
INTERVIEW_FINALIZATION_CONCURRENCY=1
SUPABASE_SERVICE_ROLE_KEY=
```

Never prefix provider or storage secrets with `NEXT_PUBLIC_`. Add the same R2 variables to both the Vercel project and the separately deployed interview worker. Only short-lived presigned URLs are sent to browsers; R2 credentials remain server-only.

## Cloudflare R2 setup

1. In Cloudflare Dashboard, open **R2 Object Storage** and create a private bucket. `magna-q-interview-videos` is the documented default, but any bucket name works if `CLOUDFLARE_R2_BUCKET` matches it.
2. Copy the **Account ID** from the R2 overview into `CLOUDFLARE_R2_ACCOUNT_ID`.
3. Select **Manage R2 API Tokens**, create an account API token scoped to this bucket with **Object Read & Write**, then copy its **Access Key ID** and **Secret Access Key** into the corresponding variables. The secret is shown once; store it in the deployment secret manager.
4. Keep public access disabled. Playback and transcription use five-minute signed GET URLs.
5. In the bucket's **Settings → CORS Policy**, allow each real application origin. Replace the sample domains before saving:

```json
[
  {
    "AllowedOrigins": [
      "https://your-production-domain.example",
      "https://your-project.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

6. Add a lifecycle rule for the `interview-videos/` prefix using the privacy/retention period you choose. Do not make the bucket public. Database scorecards are independent of object retention.
7. Add the four required R2 variables to Vercel Production and Preview as appropriate, redeploy, and restart the interview worker with the same values.
8. Apply `202608300001_cloudflare_r2_interview_storage.sql` before enabling uploads.

## Data flows

For both practice modes, the authenticated session route validates question and recording metadata, reserves a user-owned R2 object key, and returns a 15-minute presigned PUT URL. The browser uploads directly to R2. The completion route verifies the stored object's exact size and media type with `HeadObject` before it creates durable processing state.

The database records an answer-level durable outbox state, then BullMQ runs three ID-only queues:

- `interview-transcription`
- `interview-evaluation`
- `mock-finalization`

Start the independent worker with `npm run worker:interviews`. It recovers durable jobs from database statuses when it starts and every 30 seconds by default, so a temporary queue interruption does not leave uploaded recordings idle. Transcription is persisted before evaluation. Finalization is refused unless exactly eight answers and eight evaluations are present. Jobs are idempotent and use configured exponential retry.

## Evaluation boundary

Deepgram supplies transcript text, word timestamps, confidence, duration, and request ID. Speaking rate, word count, filler count, and pauses are derived in application code and shown as separate Delivery Insights. They do not affect competency scores.

OpenAI receives the question, rubric/version, anchors, critical elements, concerns, and transcript. Strict JSON schema output is validated again with Zod. The backend applies criterion weights and calculates aggregates. The evaluator is forbidden from scoring appearance, accent, protected traits, vague confidence/personality impressions, or predicted residency success.

## Operations and privacy

- Keep the R2 bucket private and use only short-lived signed URLs.
- Configure an R2 lifecycle rule using your chosen `INTERVIEW_VIDEO_RETENTION_HOURS`; allow enough time for retries and user playback.
- Restrict the R2 token to Object Read & Write on the interview bucket only.
- Run Redis with TLS, persistence, monitoring, and bounded memory.
- Run the worker separately from the web process and tune each queue's concurrency to provider limits.
- Never log API keys, video contents, or full transcripts. Structured worker logs contain only job/session/answer IDs and provider request IDs.
- Apply migrations through `202608300001_cloudflare_r2_interview_storage.sql`, then run `npm run seed:interview-rubrics` whenever the canonical mapping version changes.
