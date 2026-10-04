import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionPlayer } from "./question-player";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const navigator = Array.from({ length: 25 }, (_, index) => ({
  position: index + 1,
  answered: index === 0,
  marked: false,
}));

const answeredQuestion = {
  blockId: "block-1",
  mode: "tutor" as const,
  status: "in_progress",
  position: 1,
  total: 25,
  questionId: "question-1",
  stem: "A clinical question stem",
  keyPhrases: [],
  marked: false,
  selectedOptionId: "option-a",
  answered: true,
  options: [
    { id: "option-a", text: "First option" },
    { id: "option-b", text: "Second option" },
  ],
  navigator,
  isCorrect: false,
  correctOptionId: "option-b",
  rationales: {
    "option-a": "The selected option rationale.",
    "option-b": "The unselected option rationale.",
  },
};

describe("QuestionPlayer navigation and feedback", () => {
  afterEach(cleanup);
  beforeEach(() => window.localStorage.clear());

  it("shows ten navigator questions at a time", () => {
    render(<QuestionPlayer initial={answeredQuestion} initialNote="" />);

    expect(screen.getByRole("button", { name: "Question 10" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Question 11" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Show next 10 questions" }),
    ).toBeTruthy();
  });

  it("shows only the selected rationale as plain text", () => {
    render(<QuestionPlayer initial={answeredQuestion} initialNote="" />);

    expect(screen.getByText("The selected option rationale.")).toBeTruthy();
    expect(screen.queryByText("The unselected option rationale.")).toBeNull();
    expect(screen.queryByText(/Why this option is/)).toBeNull();
  });

  it("uses an in-app yes-or-no dialog to confirm ending the test", () => {
    const confirm = vi.spyOn(window, "confirm");
    render(<QuestionPlayer initial={answeredQuestion} initialNote="" />);

    fireEvent.click(screen.getByRole("button", { name: "End test" }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getByText("Are you sure you want to end this test?"),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Yes" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "No" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(confirm).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it("opens the laboratory reference drawer from the question toolbar", async () => {
    render(<QuestionPlayer initial={answeredQuestion} initialNote="" />);

    fireEvent.click(screen.getByRole("button", { name: "Lab values" }));

    expect(
      screen.getByRole("dialog", { name: "Laboratory values" }),
    ).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Serum" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Gases" })).toBeTruthy();
    expect(
      screen.getByRole("tab", { name: "Cerebrospinal fluid" }),
    ).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Hematologic" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Urine" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "BMI" })).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Gases" }));
    expect(screen.getByText("75–105 mm Hg")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
