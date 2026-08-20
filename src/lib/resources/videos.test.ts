import { describe, expect, it } from "vitest";
import { RESOURCE_CATEGORIES } from "./videos";

describe("resource video catalog", () => {
  it("contains the four requested categories with ten videos each", () => {
    expect(RESOURCE_CATEGORIES.map((category) => category.title)).toEqual([
      "USMLE 1",
      "USMLE 2 CK",
      "USMLE 3",
      "Interview resources",
    ]);
    expect(
      RESOURCE_CATEGORIES.every((category) => category.videos.length === 10),
    ).toBe(true);
  });

  it("uses valid, unique YouTube IDs within each category", () => {
    for (const category of RESOURCE_CATEGORIES) {
      const ids = category.videos.map((video) => video.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every((id) => /^[\w-]{11}$/.test(id))).toBe(true);
    }
  });
});
