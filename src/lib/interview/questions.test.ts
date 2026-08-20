import { describe, expect, it } from "vitest";
import { feedbackForQuestion } from "./feedback";
import { interviewCategories } from "./questions";

describe("interview practice catalog", () => {
  it("contains all document categories and questions", () => {
    expect(interviewCategories).toHaveLength(16);
    expect(
      interviewCategories.reduce(
        (total, category) => total + category.questions.length,
        0,
      ),
    ).toBe(162);
  });

  it("returns stable simulated feedback", () => {
    expect(feedbackForQuestion("Tell me about yourself.")).toEqual(
      feedbackForQuestion("Tell me about yourself."),
    );
  });
});
