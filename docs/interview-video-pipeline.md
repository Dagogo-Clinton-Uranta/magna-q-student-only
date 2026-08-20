# Interview video pipeline

The interview recorder works in demo mode without external infrastructure. In demo mode, the browser still records and plays back the 360p video, the upload progress runs for at least 22 seconds, and the student receives deterministic sample feedback. The video is not retained in demo mode.

## Production services

Configure these server-only environment variables. Never prefix them with `NEXT_PUBLIC_`.

```bash
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
# Optional for an S3-compatible service:
AWS_S3_ENDPOINT=

REDIS_URL=

OPENAI_API_KEY=
OPENAI_TRANSCRIPTION_MODEL=gpt-transcribe
OPENAI_MODEL=gpt-5.6-sol

SUPABASE_SERVICE_ROLE_KEY=
```

The web application receives video chunks, uploads them as S3 multipart parts, completes the object, records a durable database outbox job, and enqueues the video ID in BullMQ. Start the independent worker with:

```bash
npm run worker:interviews
```

The worker container also needs `ffmpeg` and `ffprobe`. It downloads the private S3 object, extracts bounded audio and representative 360p frames, transcribes the audio, asks OpenAI for structured coaching feedback, and writes the result to Supabase. On startup it re-enqueues pending outbox jobs, so a temporary Redis or worker outage does not silently lose submitted work.

## Infrastructure recommendations

- Keep the S3 bucket private. Student playback URLs are short-lived and generated only after an authenticated ownership check; staff access is handled by the separate administration module.
- Enable S3 encryption, block public access, and configure a lifecycle rule to abort incomplete multipart uploads after one day.
- Set an explicit video-retention policy and provide a deletion process before accepting real recordings.
- Use a managed Redis deployment with TLS, persistence, monitoring, and memory limits appropriate to the queue workload.
- Run multiple stateless web instances and scale worker replicas independently. BullMQ job IDs prevent duplicate queue jobs for the same video.
- Put request/body and rate limits at the ingress layer as well as the application checks.
- Add consent, privacy, and retention language before production use because recordings contain identifiable voice and image data.
- Connect the MD-review request to a successful server-side payment webhook before creating a paid review request. The current pay control intentionally performs no charge.

## Data flow

1. The student grants camera/microphone access and records at a maximum of 640×360 for two minutes.
2. The browser provides local playback and lets the student delete or submit the recording.
3. Submission creates an `interview_videos` row and sends sequential 5 MB chunks with retry handling.
4. S3 multipart upload completes; a durable `interview_analysis_jobs` row is created before BullMQ enqueueing.
5. The worker transcribes audio, evaluates the transcript and sampled frames, and stores feedback.
6. Students poll for results. Manual-review requests remain in shared data for the separate administration module.
