import { NextResponse } from "next/server";
import { z } from "zod";
import { getInterviewCategory } from "@/lib/interview/questions";
import { startMultipartUpload } from "@/lib/interview/storage";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const sessionSchema = z.object({
  categorySlug: z.string().min(1).max(120),
  question: z.string().trim().min(5).max(1000),
  mimeType: z.string().startsWith("video/").max(100),
  durationSeconds: z.number().int().min(1).max(125),
  byteSize: z
    .number()
    .int()
    .min(1)
    .max(50 * 1024 * 1024),
  width: z.number().int().min(160).max(1920),
  height: z.number().int().min(90).max(1080),
  // Keep recording metadata deliberately small and typed. This endpoint is
  // authenticated, but accepting arbitrary nested JSON would still let a paid
  // client consume excessive request/row storage or persist unexpected data.
  metadata: z
    .object({
      timerVisible: z.boolean(),
      mirroredPreview: z.boolean(),
      browser: z.string().trim().max(500),
    })
    .strict(),
});

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/interview-practice/sessions");
  if (!access.ok) return access.response;
  const { profile } = access;
  const parsed = sessionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid recording metadata." },
      { status: 400 },
    );
  const category = getInterviewCategory(parsed.data.categorySlug);
  if (!category || !category.questions.includes(parsed.data.question))
    return NextResponse.json(
      { error: "Interview question not found." },
      { status: 400 },
    );

  const id = crypto.randomUUID();
  const extension = parsed.data.mimeType.includes("mp4") ? "mp4" : "webm";
  const key = `interview-videos/${profile.id}/${id}.${extension}`;
  let multipart: Awaited<ReturnType<typeof startMultipartUpload>> = null;
  try {
    multipart = await startMultipartUpload(key, parsed.data.mimeType);
  } catch {
    return NextResponse.json(
      { error: "Could not start the durable upload." },
      { status: 503 },
    );
  }

  // Paid access and the allow-listed interview question were validated above.
  // Keep INSERT server-only so students cannot forge lifecycle, storage, or AI
  // fields through the Data API; every protected value is fixed by this route.
  const { error } = await createServiceRoleClient()
    .from("interview_videos")
    .insert({
      id,
      user_id: profile.id,
      category: category.title,
      question_answered: parsed.data.question,
      mime_type: parsed.data.mimeType,
      duration_seconds: parsed.data.durationSeconds,
      width: parsed.data.width,
      height: parsed.data.height,
      byte_size: parsed.data.byteSize,
      s3_bucket: multipart?.bucket ?? null,
      s3_key: multipart ? key : null,
      multipart_upload_id: multipart?.uploadId ?? null,
      recording_metadata: parsed.data.metadata,
      status: "uploading",
    });
  if (error)
    return NextResponse.json(
      { error: "Could not save the upload session." },
      { status: 500 },
    );
  return NextResponse.json({
    videoId: id,
    storageConfigured: Boolean(multipart),
    chunkSize: 5 * 1024 * 1024,
  });
}
