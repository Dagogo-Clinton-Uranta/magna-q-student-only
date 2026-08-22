export const INTERVIEW_ANALYSIS_QUEUE = "interview-video-analysis";

export async function enqueueInterviewAnalysis(videoId: string) {
  const redisUrl = configuredRedisUrl();
  if (!redisUrl) return false;
  const [{ Queue }, { default: IORedis }] = await Promise.all([
    import("bullmq"),
    import("ioredis"),
  ]);
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  const queue = new Queue(INTERVIEW_ANALYSIS_QUEUE, { connection });
  try {
    await queue.add(
      "analyze-interview-video",
      { videoId },
      {
        jobId: videoId,
        attempts: 5,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: 500,
        removeOnFail: 2_000,
      },
    );
    return true;
  } finally {
    await queue.close();
    await connection.quit();
  }
}
import { configuredRedisUrl } from "@/lib/redis/url";
