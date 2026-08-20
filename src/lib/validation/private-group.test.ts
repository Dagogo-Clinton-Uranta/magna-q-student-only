import { describe, expect, it } from "vitest";
import { privateGroupRequestSchema } from "./private-group";

describe("private group validation", () => {
  it("accepts a complete private group request", () => {
    expect(
      privateGroupRequestSchema.safeParse({
        groupName: "Step 2 study partners",
        reason: "We want a focused study room.",
        goal: "Complete two timed blocks together every week.",
      }).success,
    ).toBe(true);
  });

  it("rejects a request without a meaningful reason and goal", () => {
    expect(
      privateGroupRequestSchema.safeParse({
        groupName: "Group",
        reason: "Study",
        goal: "Pass",
      }).success,
    ).toBe(false);
  });
});
