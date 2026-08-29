import { describe, expect, it } from "vitest";
import { interviewQuestions } from "./questions";
import {
  mockBlueprintSlotForQuestion,
  mockInterviewBlueprint,
  selectMockInterviewQuestions,
} from "./mock-selection";

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

describe("mock interview selection", () => {
  it("selects exactly eight unique questions with controlled coverage", () => {
    const selected = selectMockInterviewQuestions({
      questions: interviewQuestions,
      specialty: "internal-medicine",
      random: seededRandom(7),
    });
    expect(selected).toHaveLength(8);
    expect(new Set(selected.map((question) => question.id))).toHaveLength(8);
    expect(selected.map(mockBlueprintSlotForQuestion)).toEqual(
      mockInterviewBlueprint,
    );
  });

  it("only uses universal or selected-specialty questions", () => {
    const selected = selectMockInterviewQuestions({
      questions: interviewQuestions,
      specialty: "psychiatry",
      random: seededRandom(11),
    });
    expect(
      selected.every(
        (question) =>
          question.specialtyRelevance.includes("general") ||
          question.specialtyRelevance.includes("psychiatry"),
      ),
    ).toBe(true);
  });

  it("varies questions across runs while retaining the blueprint", () => {
    const first = selectMockInterviewQuestions({
      questions: interviewQuestions,
      specialty: "general",
      random: seededRandom(2),
    });
    const second = selectMockInterviewQuestions({
      questions: interviewQuestions,
      specialty: "general",
      random: seededRandom(3),
    });
    expect(first.map((item) => item.id)).not.toEqual(
      second.map((item) => item.id),
    );
    expect(second.map(mockBlueprintSlotForQuestion)).toEqual(
      mockInterviewBlueprint,
    );
  });
});
