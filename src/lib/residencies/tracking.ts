import { z } from "zod";

export const residencyIdSchema = z.coerce.number().int().positive().safe();

export const residencyNotesSchema = z.object({
  residencyId: residencyIdSchema,
  notes: z.string().max(10000),
});
