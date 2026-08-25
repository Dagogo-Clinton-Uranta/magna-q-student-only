import { z } from "zod";
import { usernameSchema } from "@/lib/validation/auth";

export const featureIdSchema = z.string().uuid();

export const featureRequestSchema = z.object({
  username: usernameSchema,
  title: z.string().trim().min(5).max(160),
  summary: z.string().trim().min(40).max(5000),
  representativeQuote: z.string().trim().min(5).max(500),
  imageUrl: z.string().url().startsWith("https://"),
  imagePath: z.string().trim().min(3).max(500),
  imageStorageProvider: z.enum(["supabase", "s3"]),
  imageAltText: z.string().trim().min(5).max(240),
});

export const featureCommentSchema = z.object({
  featureId: featureIdSchema,
  content: z.string().trim().min(2).max(2000),
});

export const mentionQuerySchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(24)
  .regex(/^[a-z0-9_]*$/);
