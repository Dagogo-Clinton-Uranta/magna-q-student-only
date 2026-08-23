import { z } from "zod";

export const guidelineClassifications = [
  "usmle-step-1",
  "usmle-step-2-ck",
  "usmle-step-3",
  "residency-and-matching",
  "residency-interviews",
  "general",
] as const;

export type GuidelineClassification = (typeof guidelineClassifications)[number];

export const guidelineCardGridClassName =
  "mt-10 grid auto-rows-fr gap-5 lg:grid-cols-2";

export const guidelineCardClassName =
  "flex h-full min-h-[30rem] flex-col rounded-xl p-6";

export function getGuidelineCardPlacement(slug: string) {
  if (slug === "residency-program-signaling-strategy-2027") {
    return "lg:col-start-1 lg:row-start-2";
  }
  if (slug === "networking-your-way-into-residency-2027") {
    return "lg:col-start-2 lg:row-start-2";
  }
  return "";
}

const guidelineLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

const guidelineSectionSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1),
  introduction: z.string().min(1).optional(),
  bullets: z.array(z.string().min(1)).min(1),
  links: z.array(guidelineLinkSchema).default([]),
});

const guidelineMediaSchema = z.object({
  sectionNumber: z.number().int().positive(),
  type: z.enum(["image", "video"]),
  s3Url: z.string().url(),
  altText: z.string().min(1),
  caption: z.string().min(1).optional(),
});

const guidelineSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  summary_points: z.array(z.string().min(1)).min(1),
  classification: z.enum(guidelineClassifications),
  published_at: z.string(),
});

const guidelineArticleSchema = guidelineSummarySchema.extend({
  eyebrow: z.string().min(1),
  preamble: z.array(z.string().min(1)).min(1),
  sections: z.array(guidelineSectionSchema).min(1),
  conclusion: z.array(z.string().min(1)).min(1),
  s3_media: z.array(guidelineMediaSchema).nullable(),
  source_links: z.array(guidelineLinkSchema),
  reviewed_at: z.string(),
});

export type GuidelineSummary = z.infer<typeof guidelineSummarySchema>;
export type GuidelineArticle = z.infer<typeof guidelineArticleSchema>;
export type GuidelineSection = z.infer<typeof guidelineSectionSchema>;

export function parseGuidelineSummary(value: unknown): GuidelineSummary {
  return guidelineSummarySchema.parse(value);
}

export function parseGuidelineArticle(value: unknown): GuidelineArticle {
  const article = guidelineArticleSchema.parse(value);
  const sectionNumbers = article.sections.map((section) => section.number);

  if (new Set(sectionNumbers).size !== sectionNumbers.length) {
    throw new Error("Guideline section numbers must be unique.");
  }

  if (sectionNumbers.some((number, index) => number !== index + 1)) {
    throw new Error("Guideline sections must be numbered consecutively.");
  }

  const knownSections = new Set(sectionNumbers);
  if (
    article.s3_media?.some((asset) => !knownSections.has(asset.sectionNumber))
  ) {
    throw new Error("Guideline media must reference an existing section.");
  }

  return article;
}
