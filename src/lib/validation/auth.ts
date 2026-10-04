import { z } from "zod";
import { COUNTRIES } from "@/lib/countries";

const countryCodes = new Set(COUNTRIES.map((country) => country.code));

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters.")
  .max(24, "Use no more than 24 characters.")
  .regex(
    /^[a-z0-9_]+$/,
    "Use lowercase letters, numbers, and underscores only.",
  );

export const studentProfileSchema = z.object({
  username: usernameSchema,
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .refine((value) => countryCodes.has(value), "Select a valid country."),
  phoneCountryCode: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{0,3}$/),
  phoneNumber: z
    .string()
    .transform((value) => value.replace(/[^0-9]/g, ""))
    .pipe(z.string().min(5).max(15)),
  medicalSchool: z.string().trim().max(200).optional(),
  trainingLevel: z.string().trim().max(100).optional(),
  studyStage: z.enum(["step1", "step2ck", "step3", "residency_interviews"]),
  acceptedTerms: z.literal("on"),
});

export const authCredentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

export const signupSourceSchema = z.enum([
  "twitter",
  "google",
  "word_of_mouth",
  "instagram",
  "magna_q_agent",
  "other",
]);

export const studentRegistrationSchema = authCredentialsSchema
  .extend({
    ...studentProfileSchema.shape,
    signupSource: signupSourceSchema,
    signupSourceOther: z.string().trim().max(120).optional(),
  })
  .superRefine((registration, context) => {
    if (
      registration.signupSource === "other" &&
      !registration.signupSourceOther
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["signupSourceOther"],
        message: "Tell us how you heard about Magna-Q.",
      });
    }
  });

export const onboardingSchema = studentProfileSchema;

export const editableStudentProfileSchema = studentProfileSchema.omit({
  username: true,
  acceptedTerms: true,
});

export const editableStudentDetailsSchema = editableStudentProfileSchema
  .omit({ studyStage: true })
  .extend({ username: usernameSchema });

export const studyStageChangeSchema = z.object({
  studyStage: studentProfileSchema.shape.studyStage,
});

export const testimonialSchema = z.object({
  fromStage: studentProfileSchema.shape.studyStage,
  toStage: studentProfileSchema.shape.studyStage,
  comment: z.string().trim().min(3).max(5000),
  rating: z.coerce
    .number()
    .min(0.5)
    .max(5)
    .refine((value) => Number.isInteger(value * 2), {
      message: "Choose a whole- or half-star rating.",
    }),
  foundUseful: z.enum(["yes", "no", "unsure"]),
  wouldRecommend: z.enum(["yes", "no", "unsure"]),
});

export const feedbackPageTestimonialSchema = testimonialSchema.omit({
  fromStage: true,
  toStage: true,
});
