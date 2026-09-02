import { describe, expect, it } from "vitest";
import { calculateDeliveryMetrics } from "./delivery-metrics";

describe("delivery metrics", () => {
  it("derives timing and filler observations without model scoring", () => {
    expect(
      calculateDeliveryMetrics(
        [
          { word: "Um", start: 0, end: 0.3 },
          { word: "patient", start: 0.5, end: 1 },
          { word: "safety", start: 3.5, end: 4 },
        ],
        6,
      ),
    ).toEqual({
      durationSeconds: 6,
      wordCount: 3,
      wordsPerMinute: 30,
      fillerWordCount: 1,
      longPauseCount: 1,
      longestPauseSeconds: 2.5,
    });
  });
});
