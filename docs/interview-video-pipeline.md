# Interview video pipeline

The app is deployed with serverless-compatible assumptions: request-local files are ephemeral and never treated as durable storage. Individual practice and eight-answer mocks intentionally use different storage flows.

## Required server-only configuration

```bash
DEEPGRAM_API_KEY=
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_INTERVIEW_EVALUATION_MODEL=gpt-5.6-luna

REDIS_URL=
AWS_REGION=
INTERVIEW_VIDEO_S3_BUCKET=
# Optional when the runtime cannot use an IAM role/workload identity:
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_ENDPOINT=

INTERVIEW_VIDEO_MAX_BYTES=52428800
INTERVIEW_VIDEO_RETENTION_HOURS=24
INTERVIEW_JOB_MAX_ATTEMPTS=5
INTERVIEW_JOB_BACKOFF_MS=5000
INTERVIEW_TRANSCRIPTION_CONCURRENCY=3
INTERVIEW_EVALUATION_CONCURRENCY=2
INTERVIEW_FINALIZATION_CONCURRENCY=1
SUPABASE_SERVICE_ROLE_KEY=
```

Never prefix provider or storage secrets with `NEXT_PUBLIC_`. Prefer an IAM role or workload credentials; static AWS keys are optional.

## Data flows

Individual practice sends one bounded multipart request to the Node route. The video exists only in request memory, is transcribed with Deepgram Nova-3, evaluated against the persisted versioned rubric, and is then eligible for garbage collection. The video is not uploaded to S3 and cannot be replayed after processing. A failed request leaves no completed score and asks the student to resubmit the local browser recording.

Mock answers must finish a private S3 multipart upload before submission advances. The database records an answer-level durable outbox state, then BullMQ runs three ID-only queues:

- `interview-transcription`
- `interview-evaluation`
- `mock-finalization`

Start the independent worker with `npm run worker:interviews`. It recovers durable jobs from database statuses when it starts. Transcription is persisted before evaluation. Finalization is refused unless exactly eight answers and eight evaluations are present. Jobs are idempotent and use configured exponential retry.

## Evaluation boundary

Deepgram supplies transcript text, word timestamps, confidence, duration, and request ID. Speaking rate, word count, filler count, and pauses are derived in application code and shown as separate Delivery Insights. They do not affect competency scores.

OpenAI receives the question, rubric/version, anchors, critical elements, concerns, and transcript. Strict JSON schema output is validated again with Zod. The backend applies criterion weights and calculates aggregates. The evaluator is forbidden from scoring appearance, accent, protected traits, vague confidence/personality impressions, or predicted residency success.

## Operations and privacy

- Keep the interview bucket private, block public access, require encryption, and use short-lived signed URLs.
- Configure an S3 lifecycle rule using `INTERVIEW_VIDEO_RETENTION_HOURS`; do not remove mock objects before successful processing.
- Abort incomplete multipart uploads after one day.
- Run Redis with TLS, persistence, monitoring, and bounded memory.
- Run the worker separately from the web process and tune each queue's concurrency to provider limits.
- Never log API keys, video contents, or full transcripts. Structured worker logs contain only job/session/answer IDs and provider request IDs.
- Apply `202608290003_interview_rubrics_and_processing.sql`, then run `npm run seed:interview-rubrics` whenever the canonical mapping version changes.
