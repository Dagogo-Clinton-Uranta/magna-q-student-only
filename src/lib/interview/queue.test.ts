import { describe, expect, it } from "vitest";
import { interviewJobOptions } from "./queue";

describe("interview queue idempotency", () => {
  it("uses a stable stage-and-record job id with exponential retry", () => {
    const options = interviewJobOptions("answer-1", "transcription");
    expect(options.jobId).toBe("transcription-answer-1");
    expect(options.attempts).toBeGreaterThan(1);
    expect(options.backoff.type).toBe("exponential");
  });
});
