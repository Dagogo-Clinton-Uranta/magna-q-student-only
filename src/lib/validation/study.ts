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
