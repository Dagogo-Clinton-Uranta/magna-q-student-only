import { z } from "zod";

export const studentFeedbackSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Enter a subject of at least 3 characters.")
    .max(160, "Keep the subject under 160 characters."),
  feedback: z
    .string()
    .trim()
    .min(10, "Enter feedback of at least 10 characters.")
    .max(5000, "Keep the feedback under 5,000 characters."),
});

export function createFeedbackPreamble(feedback: string, maxLength = 90) {
  const normalized = feedback.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export type StudentFeedbackInput = z.infer<typeof studentFeedbackSchema>;
