import { describe, expect, it } from "vitest";
import { feedbackForQuestion } from "./feedback";
import { interviewCategories, interviewQuestions } from "./questions";

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

  it("reclassifies all questions with stable competency metadata", () => {
    expect(interviewQuestions).toHaveLength(162);
    expect(
      new Set(interviewQuestions.map((question) => question.id)).size,
    ).toBe(162);
    expect(
      interviewQuestions.every(
        (question) =>
          question.competencies.length >= 3 &&
          question.competencies.length <= 5,
      ),
    ).toBe(true);
    expect(
      interviewQuestions.find(
        (question) => question.text === "Tell me about a time you led a team.",
      ),
    ).toMatchObject({
      practiceArea: "leadership-systems",
      questionType: "behavioral",
    });
    expect(
      interviewQuestions.find(
        (question) => question.text === "Describe a medical error.",
      ),
    ).toMatchObject({
      practiceArea: "patient-safety-judgment",
      questionType: "behavioral",
    });
    expect(
      interviewQuestions.find(
        (question) =>
          question.text === "What would you do if a colleague was intoxicated?",
      ),
    ).toMatchObject({
      practiceArea: "professionalism-integrity",
      questionType: "situational",
    });
    expect(
      interviewQuestions.find(
        (question) => question.text === "Why Internal Medicine?",
      ),
    ).toMatchObject({
      practiceArea: "motivation-values-fit",
      questionType: "general",
      specialtyRelevance: ["internal-medicine"],
    });
  });

  it("returns stable simulated feedback", () => {
    expect(feedbackForQuestion("Tell me about yourself.")).toEqual(
      feedbackForQuestion("Tell me about yourself."),
    );
  });
});
