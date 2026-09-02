import { describe, expect, it } from "vitest";
import { interviewQuestions } from "./questions";
import { recommendInterviewQuestions } from "./recommendations";

describe("interview recommendations", () => {
  it("prioritizes weak competencies, excludes recent questions, and respects specialty", () => {
    const excluded = interviewQuestions.find(
      (question) => question.practiceArea === "patient-safety-judgment",
    )!;
    const result = recommendInterviewQuestions({
      questions: interviewQuestions,
      priorityCompetencies: [
        "patient-safety-orientation",
        "appropriate-escalation",
      ],
      specialty: "surgery",
      excludedQuestionIds: [excluded.id],
      limit: 6,
    });
    expect(result).toHaveLength(6);
    expect(result.some((question) => question.id === excluded.id)).toBe(false);
    expect(
      result.every((question) =>
        question.competencies.some((id) =>
          ["patient-safety-orientation", "appropriate-escalation"].includes(id),
        ),
      ),
    ).toBe(true);
    expect(
      result.every(
        (question) =>
          question.specialtyRelevance.includes("general") ||
          question.specialtyRelevance.includes("surgery"),
      ),
    ).toBe(true);
  });
});
