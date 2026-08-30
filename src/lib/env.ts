import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

const serverSchema = publicSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  AI_PROVIDER: z.enum(["openai"]).default("openai"),
  OPENAI_API_KEY: z.string().min(20).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-5.6-sol"),
  OPENAI_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
  OPENAI_TRANSCRIPTION_MODEL: z.string().min(1).default("gpt-transcribe"),
  OPENAI_INTERVIEW_EVALUATION_MODEL: z.string().min(1).default("gpt-5.6-luna"),
  DEEPGRAM_API_KEY: z.string().min(1).optional(),
  CLOUDFLARE_R2_ACCOUNT_ID: z.string().min(1).optional(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  CLOUDFLARE_R2_BUCKET: z.string().min(1).optional(),
  CLOUDFLARE_R2_ENDPOINT: z.string().url().optional(),
  AWS_REGION: z.string().min(1).optional(),
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  AWS_S3_BUCKET: z.string().min(1).optional(),
  AWS_S3_ENDPOINT: z.string().url().optional(),
  AWS_FEATURES_S3_BUCKET: z.string().min(1).optional(),
  AWS_FEATURES_S3_PUBLIC_URL: z.string().url().optional(),
  // Stripe secrets are optional at application startup so local non-billing
  // pages still work. Billing entry points validate the complete trio before
  // making any Stripe API call.
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_MONTHLY_PRICE_ID: z.string().min(1).optional(),
  STRIPE_LIVE_MODE: z.enum(["true", "false"]).optional(),
  REDIS_URL: z.string().url().optional(),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

function readableError(error: z.ZodError) {
  return `Invalid environment configuration: ${error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`;
}

function optionalEnvironmentValue(value: string | undefined) {
  return value && value.trim().length > 0 ? value : undefined;
}

export function getPublicEnv(): PublicEnv {
  const result = publicSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!result.success) throw new Error(readableError(result.error));
  return result.data;
}

export function getServerEnv(): ServerEnv {
  const result = serverSchema.safeParse({
    ...getPublicEnv(),
    SUPABASE_SERVICE_ROLE_KEY: optionalEnvironmentValue(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    AI_PROVIDER: optionalEnvironmentValue(process.env.AI_PROVIDER),
    OPENAI_API_KEY: optionalEnvironmentValue(process.env.OPENAI_API_KEY),
    OPENAI_MODEL: optionalEnvironmentValue(process.env.OPENAI_MODEL),
    OPENAI_BASE_URL: optionalEnvironmentValue(process.env.OPENAI_BASE_URL),
    OPENAI_TRANSCRIPTION_MODEL: optionalEnvironmentValue(
      process.env.OPENAI_TRANSCRIPTION_MODEL,
    ),
    OPENAI_INTERVIEW_EVALUATION_MODEL: optionalEnvironmentValue(
      process.env.OPENAI_INTERVIEW_EVALUATION_MODEL,
    ),
    DEEPGRAM_API_KEY: optionalEnvironmentValue(process.env.DEEPGRAM_API_KEY),
    CLOUDFLARE_R2_ACCOUNT_ID: optionalEnvironmentValue(
      process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    ),
    CLOUDFLARE_R2_ACCESS_KEY_ID: optionalEnvironmentValue(
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    ),
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: optionalEnvironmentValue(
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    ),
    CLOUDFLARE_R2_BUCKET: optionalEnvironmentValue(
      process.env.CLOUDFLARE_R2_BUCKET,
    ),
    CLOUDFLARE_R2_ENDPOINT: optionalEnvironmentValue(
      process.env.CLOUDFLARE_R2_ENDPOINT,
    ),
    AWS_REGION: optionalEnvironmentValue(process.env.AWS_REGION),
    AWS_ACCESS_KEY_ID: optionalEnvironmentValue(process.env.AWS_ACCESS_KEY_ID),
    AWS_SECRET_ACCESS_KEY: optionalEnvironmentValue(
      process.env.AWS_SECRET_ACCESS_KEY,
    ),
    AWS_S3_BUCKET: optionalEnvironmentValue(process.env.AWS_S3_BUCKET),
    AWS_S3_ENDPOINT: optionalEnvironmentValue(process.env.AWS_S3_ENDPOINT),
    AWS_FEATURES_S3_BUCKET: optionalEnvironmentValue(
      process.env.AWS_FEATURES_S3_BUCKET,
    ),
    AWS_FEATURES_S3_PUBLIC_URL: optionalEnvironmentValue(
      process.env.AWS_FEATURES_S3_PUBLIC_URL,
    ),
    STRIPE_SECRET_KEY: optionalEnvironmentValue(process.env.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: optionalEnvironmentValue(
      process.env.STRIPE_WEBHOOK_SECRET,
    ),
    STRIPE_MONTHLY_PRICE_ID: optionalEnvironmentValue(
      process.env.STRIPE_MONTHLY_PRICE_ID,
    ),
    STRIPE_LIVE_MODE: optionalEnvironmentValue(process.env.STRIPE_LIVE_MODE),
    REDIS_URL: optionalEnvironmentValue(process.env.REDIS_URL),
  });
  if (!result.success) throw new Error(readableError(result.error));
  return result.data;
}
