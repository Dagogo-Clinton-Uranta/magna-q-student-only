import { describe, expect, it } from "vitest";
import {
  getStageDefinition,
  getStageForGuideSlug,
  getStageForResourceSlug,
  STAGE_DEFINITIONS,
} from "@/lib/stages";

describe("student stage compartmentalization", () => {
  it("maps each rank to exactly one resource category and guideline", () => {
    expect(STAGE_DEFINITIONS.map((stage) => stage.rank)).toEqual([1, 2, 3, 4]);
    expect(
      new Set(STAGE_DEFINITIONS.map((stage) => stage.resourceSlug)).size,
    ).toBe(4);
    expect(
      new Set(STAGE_DEFINITIONS.map((stage) => stage.guideSlug)).size,
    ).toBe(4);
  });

  it("uses interview and Match content for the highest rank", () => {
    const stage = getStageDefinition("residency_interviews");
    expect(stage.rank).toBe(4);
    expect(stage.examCode).toBeNull();
    expect(stage.resourceSlug).toBe("interview-resources");
    expect(stage.guideSlug).toBe("residency-match");
  });

  it("resolves resource and guideline ownership", () => {
    expect(getStageForResourceSlug("usmle-step-2-ck")).toBe("step2ck");
    expect(getStageForGuideSlug("step-3")).toBe("step3");
    expect(getStageForGuideSlug("not-a-guide")).toBeUndefined();
  });
});
