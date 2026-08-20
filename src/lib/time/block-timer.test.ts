import { describe, expect, it } from "vitest";
import { formatClock, remainingSeconds } from "./block-timer";
describe("block timer", () => {
  it("subtracts persisted and active elapsed time", () =>
    expect(
      remainingSeconds({
        timeLimitSeconds: 900,
        elapsedSeconds: 120,
        segmentStartedAt: "2026-01-01T00:00:00Z",
        nowMs: Date.parse("2026-01-01T00:01:00Z"),
      }),
    ).toBe(720));
  it("never becomes negative", () =>
    expect(
      remainingSeconds({
        timeLimitSeconds: 1,
        elapsedSeconds: 10,
        segmentStartedAt: null,
        nowMs: 0,
      }),
    ).toBe(0));
  it("formats clocks", () => expect(formatClock(65)).toBe("1:05"));
});
