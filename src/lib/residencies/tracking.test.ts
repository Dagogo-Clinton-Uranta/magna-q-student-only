import { describe, expect, it } from "vitest";
import { residencyIdSchema, residencyNotesSchema } from "./tracking";

describe("residency tracking input", () => {
  it("accepts a positive safe residency id", () => {
    expect(residencyIdSchema.parse("42")).toBe(42);
    expect(residencyIdSchema.safeParse("0").success).toBe(false);
    expect(residencyIdSchema.safeParse("not-an-id").success).toBe(false);
  });

  it("allows an eight-line note while enforcing the storage limit", () => {
    expect(
      residencyNotesSchema
        .parse({
          residencyId: "42",
          notes: Array.from(
            { length: 8 },
            (_, index) => `Line ${index + 1}`,
          ).join("\n"),
        })
        .notes.split("\n"),
    ).toHaveLength(8);
    expect(
      residencyNotesSchema.safeParse({
        residencyId: "42",
        notes: "x".repeat(10001),
      }).success,
    ).toBe(false);
  });
});
