import { configuredRedisUrl } from "@/lib/redis/url";

export const INTERVIEW_TRANSCRIPTION_QUEUE = "interview-transcription";
export const INTERVIEW_EVALUATION_QUEUE = "interview-evaluation";
export const MOCK_FINALIZATION_QUEUE = "mock-finalization";

export function interviewJobOptions(id: string, stage: string) {
  const attempts = positiveInteger(process.env.INTERVIEW_JOB_MAX_ATTEMPTS, 5);
  const delay = positiveInteger(process.env.INTERVIEW_JOB_BACKOFF_MS, 5_000);
  return {
    jobId: `${stage}-${id}`,
    attempts,
    backoff: { type: "exponential" as const, delay },
    removeOnComplete: 500,
    removeOnFail: 2_000,
  };
}

async function enqueue(queueName: string, stage: string, id: string) {
  const redisUrl = configuredRedisUrl();
  if (!redisUrl) return false;
  const [{ Queue }, { default: IORedis }] = await Promise.all([
    import("bullmq"),
    import("ioredis"),
  ]);
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  const queue = new Queue(queueName, { connection });
  try {
    const options = interviewJobOptions(id, stage);
    const existing = await queue.getJob(options.jobId);
    if (existing && (await existing.getState()) === "failed")
      await existing.retry();
    else if (!existing)
      await queue.add(stage, { id }, options);
    return true;
  } finally {
    await queue.close();
    await connection.quit();
  }
}

export const enqueueInterviewTranscription = (answerId: string) =>
  enqueue(INTERVIEW_TRANSCRIPTION_QUEUE, "transcription", answerId);
export const enqueueInterviewEvaluation = (answerId: string) =>
  enqueue(INTERVIEW_EVALUATION_QUEUE, "evaluation", answerId);
export const enqueueMockFinalization = (sessionId: string) =>
  enqueue(MOCK_FINALIZATION_QUEUE, "finalization", sessionId);

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
