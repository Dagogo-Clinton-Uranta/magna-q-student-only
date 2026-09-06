import { describe, expect, it } from "vitest";
import {
  blockFiltersSchema,
  createStep1BlockSchema,
  createStep2BlockSchema,
  step1BlockFiltersSchema,
  step2BlockFiltersSchema,
} from "./study";
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

describe("Step 1 block filters", () => {
  const examId = "10000000-0000-0000-0000-000000000001";
  const systemId = "20000000-0000-0000-0000-000000000001";

  it("keeps systems, disciplines, and competencies independent", () =>
    expect(
      step1BlockFiltersSchema.safeParse({
        examId,
        usages: ["unused"],
        systemIds: [systemId],
        disciplineIds: ["30000000-0000-0000-0000-000000000001"],
        competencyIds: ["40000000-0000-0000-0000-000000000001"],
      }).success,
    ).toBe(true));

  it("requires at least one Step 1 system", () =>
    expect(
      step1BlockFiltersSchema.safeParse({
        examId,
        usages: ["unused"],
        systemIds: [],
      }).success,
    ).toBe(false));

  it("caps a current-format Step 1 block at 20 questions", () => {
    const base = {
      examId,
      usages: ["unused"],
      systemIds: [systemId],
    };
    expect(
      createStep1BlockSchema.safeParse({ ...base, requestedCount: 20 }).success,
    ).toBe(true);
    expect(
      createStep1BlockSchema.safeParse({ ...base, requestedCount: 21 }).success,
    ).toBe(false);
  });
});

describe("Step 2 CK block filters", () => {
  const examId = "10000000-0000-0000-0000-000000000001";
  const systemId = "20000000-0000-0000-0000-000000000001";

  it("requires a system but leaves the other blueprint axes optional", () => {
    expect(
      step2BlockFiltersSchema.safeParse({
        examId,
        usages: ["unused"],
        systemIds: [systemId],
      }).success,
    ).toBe(true);
    expect(
      step2BlockFiltersSchema.safeParse({
        examId,
        usages: ["unused"],
        systemIds: [],
      }).success,
    ).toBe(false);
  });

  it("accepts independent clinical-science, competency, topic, and nutrition filters", () =>
    expect(
      step2BlockFiltersSchema.safeParse({
        examId,
        usages: ["unused", "incorrect"],
        systemIds: [systemId],
        clinicalScienceIds: ["30000000-0000-0000-0000-000000000001"],
        competencyIds: ["40000000-0000-0000-0000-000000000001"],
        topics: [
          "20000000-0000-0000-0000-000000000001:Acute coronary syndrome",
        ],
        difficulties: ["medium", "hard"],
        nutritionFilter: "only",
      }).success,
    ).toBe(true));

  it("rejects duplicate values within a Step 2 selection axis", () =>
    expect(
      step2BlockFiltersSchema.safeParse({
        examId,
        usages: ["unused"],
        systemIds: [systemId, systemId],
      }).success,
    ).toBe(false));

  it("caps a Step 2 CK block at 20 questions", () => {
    const base = {
      examId,
      usages: ["unused"],
      systemIds: [systemId],
    };
    expect(
      createStep2BlockSchema.safeParse({ ...base, requestedCount: 20 }).success,
    ).toBe(true);
    expect(
      createStep2BlockSchema.safeParse({ ...base, requestedCount: 21 }).success,
    ).toBe(false);
  });
});
