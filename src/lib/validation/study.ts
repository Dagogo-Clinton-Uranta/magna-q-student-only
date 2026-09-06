import { z } from "zod";
export const blockFiltersSchema = z.object({
  examId: z.string().uuid(),
  mode: z.enum(["tutor", "timed"]).default("tutor"),
  usages: z
    .array(z.enum(["unused", "incorrect", "marked", "correct"]))
    .min(1)
    .max(4)
    .refine((values) => new Set(values).size === values.length),
  subjectIds: z.array(z.string().uuid()).min(1).max(100),
  categoryIds: z.array(z.string().uuid()).max(200).default([]),
});
export const createBlockSchema = blockFiltersSchema.extend({
  requestedCount: z.number().int().min(1).max(200),
});
export type BlockFilters = z.infer<typeof blockFiltersSchema>;

export const step2BlockFiltersSchema = z.object({
  examId: z.string().uuid(),
  mode: z.enum(["tutor", "timed"]).default("tutor"),
  usages: z
    .array(z.enum(["unused", "incorrect", "marked", "correct"]))
    .min(1)
    .max(4)
    .refine((values) => new Set(values).size === values.length),
  systemIds: z
    .array(z.string().uuid())
    .min(1)
    .max(14)
    .refine((values) => new Set(values).size === values.length),
  clinicalScienceIds: z
    .array(z.string().uuid())
    .max(5)
    .default([])
    .refine((values) => new Set(values).size === values.length),
  competencyIds: z
    .array(z.string().uuid())
    .max(10)
    .default([])
    .refine((values) => new Set(values).size === values.length),
  topics: z
    .array(z.string().trim().min(38).max(1040))
    .max(300)
    .default([])
    .refine((values) => new Set(values).size === values.length),
  difficulties: z
    .array(z.enum(["easy", "medium", "hard"]))
    .max(3)
    .default([])
    .refine((values) => new Set(values).size === values.length),
  nutritionFilter: z.enum(["all", "only", "exclude"]).default("all"),
});

export const createStep2BlockSchema = step2BlockFiltersSchema.extend({
  requestedCount: z.number().int().min(1).max(20),
});

export type Step2BlockFilters = z.infer<typeof step2BlockFiltersSchema>;

export const step1BlockFiltersSchema = z.object({
  examId: z.string().uuid(),
  mode: z.enum(["tutor", "timed"]).default("tutor"),
  usages: z
    .array(z.enum(["unused", "incorrect", "marked", "correct"]))
    .min(1)
    .max(4)
    .refine((values) => new Set(values).size === values.length),
  systemIds: z
    .array(z.string().uuid())
    .min(1)
    .max(22)
    .refine((values) => new Set(values).size === values.length),
  disciplineIds: z
    .array(z.string().uuid())
    .max(13)
    .default([])
    .refine((values) => new Set(values).size === values.length),
  competencyIds: z
    .array(z.string().uuid())
    .max(5)
    .default([])
    .refine((values) => new Set(values).size === values.length),
  topics: z
    .array(z.string().trim().min(38).max(1040))
    .max(500)
    .default([])
    .refine((values) => new Set(values).size === values.length),
  difficulties: z
    .array(z.enum(["easy", "medium", "hard"]))
    .max(3)
    .default([])
    .refine((values) => new Set(values).size === values.length),
});

export const createStep1BlockSchema = step1BlockFiltersSchema.extend({
  requestedCount: z.number().int().min(1).max(20),
});

export type Step1BlockFilters = z.infer<typeof step1BlockFiltersSchema>;
