import { describe, expect, it } from "vitest";
import {
  getResourceSection,
  getResourceSectionForStage,
  parseResourceArticle,
} from "./articles";

const article = {
  id: "10000000-0000-4000-8000-000000000001",
  slug: "sample-resource",
  title: "Sample resource article",
  eyebrow: "Sample resource",
  summary: "A sufficiently detailed summary for this sample resource article.",
  summary_points: ["First point", "Second point"],
  classification: "usmle-step-1",
  resource_section: "USMLE outline",
  preamble: ["Opening context for the sample resource."],
  sections: [
    {
      number: 1,
      title: "First section",
      bullets: ["A useful first point."],
      links: [],
    },
  ],
  conclusion: ["A final takeaway for this sample resource."],
  s3_media: null,
  source_links: [],
  document_s3_url: null,
  reviewed_at: "2026-08-27",
  published_at: "2026-08-27T12:00:00.000Z",
};

describe("resource articles", () => {
  it("maps every student stage to its article library", () => {
    expect(getResourceSectionForStage("step1").slug).toBe("step-1");
    expect(getResourceSectionForStage("step2ck").slug).toBe("step-2-ck");
    expect(getResourceSectionForStage("step3").slug).toBe("step-3");
    expect(getResourceSectionForStage("residency_interviews").slug).toBe(
      "residency-match",
    );
    expect(getResourceSection("missing-section")).toBeUndefined();
  });

  it("accepts a structured resource article", () => {
    expect(parseResourceArticle(article).sections[0]?.number).toBe(1);
  });

  it("accepts HTTPS S3 media and rejects media for a missing section", () => {
    expect(
      parseResourceArticle({
        ...article,
        s3_media: [
          {
            sectionNumber: 1,
            type: "image",
            s3Url: "https://example-bucket.s3.amazonaws.com/resource.png",
            altText: "Sample learning diagram",
          },
        ],
      }).s3_media,
    ).toHaveLength(1);

    expect(() =>
      parseResourceArticle({
        ...article,
        s3_media: [
          {
            sectionNumber: 2,
            type: "video",
            s3Url: "https://example-bucket.s3.amazonaws.com/resource.mp4",
            altText: "Sample resource video",
          },
        ],
      }),
    ).toThrow("Resource media must reference an existing section.");
  });
});
