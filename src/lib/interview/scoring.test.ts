import { describe, expect, it } from "vitest";
import {
  aggregateCompetencyScores,
  overallPracticeAssessment,
  strongestAndWeakestCompetencies,
  weightedQuestionScore,
} from "./scoring";
import type { QuestionEvaluationInput } from "./types";

const evaluations: QuestionEvaluationInput[] = [
  {
    questionId: "q1",
    rubricId: "rubric",
    rubricVersion: "1",
    strengths: [],
    improvements: [],
    competencyScores: [
      {
        competencyId: "communication-interpersonal",
        score: 4,
        weight: 2,
        evidence: "Clear opening",
        feedback: "",
      },
      {
        competencyId: "teamwork-collaboration",
        score: 2,
        weight: 1,
        evidence: "Team role unclear",
        feedback: "",
      },
    ],
  },
  {
    questionId: "q2",
    rubricId: "rubric",
    rubricVersion: "1",
    strengths: [],
    improvements: [],
    competencyScores: [
      {
        competencyId: "communication-interpersonal",
        score: 5,
        weight: 1,
        evidence: "Concise",
        feedback: "",
      },
      {
        competencyId: "professionalism-integrity",
        score: 3,
        weight: 1,
        evidence: "Owned decision",
        feedback: "",
      },
    ],
  },
];

describe("competency scoring", () => {
  it("calculates a weighted question score", () => {
    expect(weightedQuestionScore(evaluations[0]!)).toBeCloseTo(10 / 3);
  });

  it("aggregates competencies independently", () => {
    const aggregates = aggregateCompetencyScores(evaluations);
    expect(
      aggregates.find(
        (item) => item.competencyId === "communication-interpersonal",
      )?.score,
    ).toBeCloseTo(13 / 3);
    expect(
      aggregates.find((item) => item.competencyId === "teamwork-collaboration")
        ?.score,
    ).toBe(2);
  });

  it("calculates an overall practice assessment and strongest/weakest areas", () => {
    expect(overallPracticeAssessment(evaluations)).toBeCloseTo(
      (10 / 3 + 4) / 2,
    );
    const result = strongestAndWeakestCompetencies(
      aggregateCompetencyScores(evaluations),
    );
    expect(result.strongest[0]?.competencyId).toBe(
      "communication-interpersonal",
    );
    expect(result.weakest[0]?.competencyId).toBe("teamwork-collaboration");
  });
});
