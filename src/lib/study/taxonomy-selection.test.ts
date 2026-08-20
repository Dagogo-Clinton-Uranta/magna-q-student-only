import { describe, expect, it } from "vitest";
import { enabledSystemIdsForSubjects } from "./taxonomy-selection";

const mappings = [
  { subject_id: "medicine", category_id: "allergy" },
  { subject_id: "medicine", category_id: "cardiovascular" },
  { subject_id: "surgery", category_id: "allergy" },
  { subject_id: "surgery", category_id: "trauma" },
];

describe("enabledSystemIdsForSubjects", () => {
  it("shows only systems belonging to the selected subject", () => {
    expect([...enabledSystemIdsForSubjects(["surgery"], mappings)]).toEqual([
      "allergy",
      "trauma",
    ]);
  });

  it("unions shared and distinct systems when subjects are added", () => {
    expect(
      [
        ...enabledSystemIdsForSubjects(["medicine", "surgery"], mappings),
      ].sort(),
    ).toEqual(["allergy", "cardiovascular", "trauma"]);
  });

  it("returns no systems until a subject is selected", () => {
    expect(enabledSystemIdsForSubjects([], mappings).size).toBe(0);
  });
});
