import { describe, expect, it } from "vitest";
import { interviewQuestions } from "./questions";
import {
  coreInterviewCompetencies,
  INTERVIEW_RUBRIC_VERSION,
  rubricFamilyForQuestion,
} from "./rubric-catalog";

describe("versioned interview rubric mapping", () => {
  it("maps every real application question without substitutes", () => {
    expect(interviewQuestions).toHaveLength(162);
    expect(
      new Set(interviewQuestions.map((question) => question.id)).size,
    ).toBe(162);
  });

  it("uses 3-5 known competencies whose weights total one", () => {
    const known = new Set(coreInterviewCompetencies.map((item) => item.id));
    expect(coreInterviewCompetencies).toHaveLength(40);
    for (const question of interviewQuestions) {
      const family = rubricFamilyForQuestion(question);
      expect(family.criteria.length).toBeGreaterThanOrEqual(3);
      expect(family.criteria.length).toBeLessThanOrEqual(5);
      expect(
        family.criteria.reduce((sum, item) => sum + item.weight, 0),
      ).toBeCloseTo(1, 8);
      expect(
        family.criteria.every((item) => known.has(item.competencyId)),
      ).toBe(true);
      expect(question.rubricId).toBe(
        `${family.id}@${INTERVIEW_RUBRIC_VERSION}`,
      );
    }
  });

  it("gives every competency five observable anchors", () => {
    for (const competency of coreInterviewCompetencies)
      expect(Object.keys(competency.anchors)).toEqual([
        "1",
        "2",
        "3",
        "4",
        "5",
      ]);
  });
});
