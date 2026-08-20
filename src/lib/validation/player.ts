import { z } from "zod";
export const answerSchema = z.object({
  position: z.number().int().positive(),
  selectedOptionId: z.string().uuid(),
  submissionKey: z.string().uuid(),
  timeSpentMs: z.number().int().min(0).max(7200000),
});
export const markSchema = z.object({
  position: z.number().int().positive(),
  marked: z.boolean(),
});
export const noteSchema = z.object({
  questionId: z.string().uuid(),
  note: z.string().max(10000),
});
