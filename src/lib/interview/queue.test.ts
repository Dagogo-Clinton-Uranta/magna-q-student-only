import { describe, expect, it } from "vitest";
import {
  INTERVIEW_EVALUATION_QUEUE,
  INTERVIEW_TRANSCRIPTION_QUEUE,
  interviewJobOptions,
  MOCK_FINALIZATION_QUEUE,
} from "./queue";

describe("interview queue idempotency", () => {
  it("uses a stable stage-and-record job id with exponential retry", () => {
    const options = interviewJobOptions("answer-1", "transcription");
    expect(options.jobId).toBe("transcription-answer-1");
    expect(options.attempts).toBeGreaterThan(1);
    expect(options.backoff.type).toBe("exponential");
    expect(options.attempts).toBe(5);
    expect(options.backoff.delay).toBe(5_000);
  });

  it("uses the queue names consumed by the Railway worker", () => {
    expect(INTERVIEW_TRANSCRIPTION_QUEUE).toBe("interview-transcription");
    expect(INTERVIEW_EVALUATION_QUEUE).toBe("interview-evaluation");
    expect(MOCK_FINALIZATION_QUEUE).toBe("mock-finalization");
  });
});
