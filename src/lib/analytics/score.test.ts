import { describe, expect, it } from "vitest";
import { calculateScore } from "./score";
describe("score calculation", () => {
  it("counts unanswered in the denominator", () =>
    expect(calculateScore([true, false, null])).toEqual({
      total: 3,
      correct: 1,
      incorrect: 1,
      unanswered: 1,
      percentage: 33.3,
    }));
});
