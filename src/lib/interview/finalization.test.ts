import { describe, expect, it } from "vitest";
import { individualFailureResultState, mockReadyForFinalization } from "./finalization";

describe("interview finalization guards", () => {
  it("requires exactly eight evaluated answers and evaluations", () => {
    expect(mockReadyForFinalization(Array.from({ length: 8 }, () => ({ status: "EVALUATED" })), 8)).toBe(true);
    expect(mockReadyForFinalization(Array.from({ length: 7 }, () => ({ status: "EVALUATED" })), 7)).toBe(false);
    expect(mockReadyForFinalization([...Array.from({ length: 7 }, () => ({ status: "EVALUATED" })), { status: "FAILED" }], 7)).toBe(false);
  });

  it("does not turn an individual provider failure into a completed score", () => {
    expect(individualFailureResultState()).toEqual({ status: "failed", completedAt: null, score: null });
  });
});
