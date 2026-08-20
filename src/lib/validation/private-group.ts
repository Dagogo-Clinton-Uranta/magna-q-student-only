import { z } from "zod";

export const privateGroupRequestSchema = z.object({
  groupName: z.string().trim().min(3).max(80),
  reason: z.string().trim().min(10).max(1_000),
  goal: z.string().trim().min(10).max(2_000),
});

export const groupMemberIdentifierSchema = z.string().trim().min(3).max(254);
