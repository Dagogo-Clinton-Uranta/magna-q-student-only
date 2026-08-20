import { describe, expect, it } from "vitest";
import { blockFiltersSchema } from "./study";
describe("study block filters", () => {
  const examId = "10000000-0000-0000-0000-000000000001";
  it("requires at least one subject", () =>
    expect(
      blockFiltersSchema.safeParse({
        examId,
        usages: ["unused"],
        subjectIds: [],
        categoryIds: [],
      }).success,
    ).toBe(false));
  it("allows multiple distinct question history types", () =>
    expect(
      blockFiltersSchema.safeParse({
        examId,
        usages: ["unused", "incorrect", "marked", "correct"],
        subjectIds: [examId],
      }).success,
    ).toBe(true));
  it("requires at least one question history type", () =>
    expect(
      blockFiltersSchema.safeParse({
        examId,
        usages: [],
        subjectIds: [examId],
      }).success,
    ).toBe(false));
});
