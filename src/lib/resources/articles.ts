import { z } from "zod";
import type { StudentStage } from "@/lib/stages";

export const resourceClassifications = [
  "usmle-step-1",
  "usmle-step-2-ck",
  "usmle-step-3",
  "residency-and-matching",
] as const;

export type ResourceClassification =
  (typeof resourceClassifications)[number];

export const resourceSections = [
  {
    slug: "step-1",
    stage: "step1",
    classification: "usmle-step-1",
    title: "USMLE Step 1 resources",
    description:
      "Practical articles for foundational science review, study planning, question-bank use, and exam readiness.",
  },
  {
    slug: "step-2-ck",
    stage: "step2ck",
    classification: "usmle-step-2-ck",
    title: "USMLE Step 2 CK resources",
    description:
      "Practical articles for clinical reasoning, shelf preparation, question review, and Step 2 CK planning.",
  },
  {
    slug: "step-3",
    stage: "step3",
    classification: "usmle-step-3",
    title: "USMLE Step 3 resources",
    description:
      "Practical articles for advanced clinical decision-making, CCS preparation, and exam-day strategy.",
  },
  {
    slug: "residency-match",
    stage: "residency_interviews",
    classification: "residency-and-matching",
    title: "Residency matching resources",
    description:
      "Practical articles for program research, applications, interviews, ranking, and the Match.",
  },
] as const;

export type ResourceSection = (typeof resourceSections)[number];

export function getResourceSection(slug: string) {
  return resourceSections.find((section) => section.slug === slug);
}

export function getResourceSectionForStage(stage: StudentStage) {
  return resourceSections.find((section) => section.stage === stage)!;
}

const resourceLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

const resourceArticleSectionSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1),
  introduction: z.string().min(1).optional(),
  bullets: z.array(z.string().min(1)).min(1),
  links: z.array(resourceLinkSchema).default([]),
});

const resourceMediaSchema = z.object({
  sectionNumber: z.number().int().positive(),
  type: z.enum(["image", "video"]),
  s3Url: z.string().url().startsWith("https://"),
  altText: z.string().min(1),
  caption: z.string().min(1).optional(),
});

const resourceSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  summary_points: z.array(z.string().min(1)).min(1),
  classification: z.enum(resourceClassifications),
  resource_section: z.string().min(1),
  published_at: z.string(),
});

const resourceArticleSchema = resourceSummarySchema.extend({
  eyebrow: z.string().min(1),
  preamble: z.array(z.string().min(1)).min(1),
  sections: z.array(resourceArticleSectionSchema).min(1),
  conclusion: z.array(z.string().min(1)).min(1),
  s3_media: z.array(resourceMediaSchema).nullable(),
  source_links: z.array(resourceLinkSchema),
  document_s3_url: z
    .union([
      z.string().url().startsWith("https://"),
      z.string().regex(/^\/assets\/[a-zA-Z0-9_-]+\.pdf$/),
    ])
    .nullable(),
  reviewed_at: z.string(),
});

export type ResourceSummary = z.infer<typeof resourceSummarySchema>;
export type ResourceArticle = z.infer<typeof resourceArticleSchema>;

export function parseResourceSummary(value: unknown): ResourceSummary {
  return resourceSummarySchema.parse(value);
}

export function parseResourceArticle(value: unknown): ResourceArticle {
  const article = resourceArticleSchema.parse(value);
  const sectionNumbers = article.sections.map((section) => section.number);

  if (new Set(sectionNumbers).size !== sectionNumbers.length) {
    throw new Error("Resource section numbers must be unique.");
  }
  if (sectionNumbers.some((number, index) => number !== index + 1)) {
    throw new Error("Resource sections must be numbered consecutively.");
  }

  const knownSections = new Set(sectionNumbers);
  if (
    article.s3_media?.some((asset) => !knownSections.has(asset.sectionNumber))
  ) {
    throw new Error("Resource media must reference an existing section.");
  }

  return article;
}
