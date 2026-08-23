import { describe, expect, it } from "vitest";
import {
  getGuidelineCardPlacement,
  guidelineCardClassName,
  guidelineCardGridClassName,
  parseGuidelineArticle,
} from "./articles";

const validArticle = {
  id: "d60aed0c-6403-4bbb-a1f8-7166d066fbec",
  slug: "example-guideline",
  title: "Example guideline article",
  eyebrow: "Example",
  summary: "A sufficiently detailed guideline summary for a student.",
  summary_points: ["First topic", "Second topic"],
  classification: "residency-and-matching",
  published_at: "2026-08-22T20:28:11.000Z",
  preamble: ["Opening context for the guideline."],
  sections: [
    {
      number: 1,
      title: "First section",
      bullets: ["One practical point."],
      links: [],
    },
  ],
  conclusion: ["A concise final takeaway."],
  s3_media: null,
  source_links: [],
  reviewed_at: "2026-08-22",
} as const;

describe("guideline article records", () => {
  it("accepts the shared numbered-section shape", () => {
    expect(parseGuidelineArticle(validArticle).sections[0]?.number).toBe(1);
  });

  it("uses equal card tracks and places networking below official sources", () => {
    expect(guidelineCardGridClassName).toContain("auto-rows-fr");
    expect(guidelineCardGridClassName).toContain("lg:grid-cols-2");
    expect(guidelineCardClassName).toContain("min-h-[30rem]");
    expect(guidelineCardClassName).toContain("h-full");
    expect(
      getGuidelineCardPlacement("networking-your-way-into-residency-2027"),
    ).toContain("lg:col-start-2");
    expect(
      getGuidelineCardPlacement("networking-your-way-into-residency-2027"),
    ).toContain("lg:row-start-2");
  });

  it("rejects non-consecutive section numbers", () => {
    expect(() =>
      parseGuidelineArticle({
        ...validArticle,
        sections: [{ ...validArticle.sections[0], number: 2 }],
      }),
    ).toThrow("numbered consecutively");
  });

  it("rejects S3 media assigned to a missing section", () => {
    expect(() =>
      parseGuidelineArticle({
        ...validArticle,
        s3_media: [
          {
            sectionNumber: 2,
            type: "image",
            s3Url: "https://example-bucket.s3.amazonaws.com/guide.png",
            altText: "Example guideline figure",
          },
        ],
      }),
    ).toThrow("existing section");
  });
});
