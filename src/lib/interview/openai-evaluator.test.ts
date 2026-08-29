import { describe, expect, it } from "vitest";
import { interviewEvaluationSchema } from "./openai-evaluator";

describe("structured interview evaluation", () => {
  it("rejects scores outside the rubric scale", () => {
    const result = interviewEvaluationSchema.safeParse({
      criteria: ["a", "b", "c"].map((competencyId) => ({ competencyId, score: 6, evidence: "evidence", missingForNextLevel: "next" })),
      strengths: [], improvements: [], summary: "summary",
      criticalElementsMissing: [], redFlagsObserved: [],
    });
    expect(result.success).toBe(false);
  });
});
