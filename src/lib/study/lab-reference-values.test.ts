import { describe, expect, it } from "vitest";
import { LAB_REFERENCE_CATEGORIES } from "./lab-reference-values";

describe("NBME laboratory reference values", () => {
  it("contains all six PDF categories and all 88 laboratory rows", () => {
    expect(LAB_REFERENCE_CATEGORIES.map((category) => category.label)).toEqual([
      "Serum",
      "Gases",
      "Cerebrospinal fluid",
      "Hematologic",
      "Urine",
      "BMI",
    ]);

    const rows = LAB_REFERENCE_CATEGORIES.flatMap((category) =>
      category.groups.flatMap((group) => group.rows),
    );
    expect(rows).toHaveLength(88);
    expect(
      rows.every((row) => row.test && row.referenceRange && row.siInterval),
    ).toBe(true);
  });
});
