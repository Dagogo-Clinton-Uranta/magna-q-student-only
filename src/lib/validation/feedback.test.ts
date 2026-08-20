import { describe, expect, it } from "vitest";
import { createFeedbackPreamble, studentFeedbackSchema } from "./feedback";

describe("student feedback", () => {
  it("trims and accepts a valid subject and suggestion", () => {
    const result = studentFeedbackSchema.parse({
      subject: "  Interview practice  ",
      feedback: "  Please add more paediatrics interview questions.  ",
    });

    expect(result).toEqual({
      subject: "Interview practice",
      feedback: "Please add more paediatrics interview questions.",
    });
  });

  it("rejects missing or overly short feedback", () => {
    expect(
      studentFeedbackSchema.safeParse({ subject: "", feedback: "Too short" })
        .success,
    ).toBe(false);
  });

  it("creates a compact single-line preamble", () => {
    expect(
      createFeedbackPreamble("I am struggling\nwith timed tests", 20),
    ).toBe("I am struggling wit…");
  });
});
