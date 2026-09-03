import { describe, expect, it } from "vitest";
import {
  directoryHref,
  getDirectoryResearchDate,
  isDirectorySort,
  isVisaFilter,
  parseFilterOptions,
  RESIDENCIES_PER_PAGE,
} from "./directory";

describe("residency directory filters", () => {
  it("uses the requested 25-program page size", () => {
    expect(RESIDENCIES_PER_PAGE).toBe(25);
  });

  it("shows the 21st day of the previous calendar month", () => {
    expect(getDirectoryResearchDate(new Date("2026-08-22T12:00:00Z"))).toBe(
      "July 21, 2026",
    );
    expect(getDirectoryResearchDate(new Date("2027-01-05T12:00:00Z"))).toBe(
      "December 21, 2026",
    );
  });

  it("accepts only supported visa filters", () => {
    expect(isVisaFilter("j1")).toBe(true);
    expect(isVisaFilter("both")).toBe(true);
    expect(isVisaFilter("untrusted-filter")).toBe(false);
  });

  it("accepts only supported directory sorts", () => {
    expect(isDirectorySort("default")).toBe(true);
    expect(isDirectorySort("img-desc")).toBe(true);
    expect(isDirectorySort("img-asc")).toBe(false);
  });

  it("parses only valid searchable options", () => {
    expect(
      parseFilterOptions({
        specialties: [
          { label: "Internal Medicine", value: "Internal Medicine" },
          { label: 12, value: "invalid" },
        ],
        locations: [{ label: "Birmingham, AL", value: "AL|Birmingham" }],
      }),
    ).toEqual({
      specialties: [{ label: "Internal Medicine", value: "Internal Medicine" }],
      locations: [{ label: "Birmingham, AL", value: "AL|Birmingham" }],
    });
  });

  it("preserves active filters in pagination links", () => {
    expect(
      directoryHref({
        page: 3,
        specialty: "Internal Medicine",
        location: "AL|Birmingham",
        visa: "j1",
        sort: "img-desc",
        imgDataOnly: true,
      }),
    ).toBe(
      "/resources/residency-directory?specialty=Internal+Medicine&location=AL%7CBirmingham&visa=j1&sort=img-desc&imgData=available&page=3",
    );
  });
});
