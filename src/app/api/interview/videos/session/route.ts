import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getInterviewCategory,
  getInterviewQuestion,
} from "@/lib/interview/questions";
import { createInterviewUploadUrl } from "@/lib/interview/storage";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const sessionSchema = z.object({
  categorySlug: z.string().min(1).max(120),
  questionId: z.string().min(1).max(160).optional(),
  mockSessionId: z.string().uuid().optional(),
  mockPosition: z.number().int().min(0).max(7).optional(),
  question: z.string().trim().min(5).max(1000),
  mimeType: z
    .string()
    .max(100)
    .refine(
      (value) =>
        ["video/webm", "video/mp4", "video/quicktime"].includes(
          value.split(";", 1)[0] ?? "",
        ),
      "Unsupported video type",
    ),
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
  if (
    !(await checkRateLimit("interview-upload", profile.id, request, 30, 3600))
  )
    return NextResponse.json(
      { error: "Interview upload limit reached. Please try again later." },
      { status: 429 },
    );
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
  const modeledQuestion = parsed.data.questionId
    ? getInterviewQuestion(parsed.data.questionId)
    : undefined;
  if (parsed.data.questionId && modeledQuestion?.text !== parsed.data.question)
    return NextResponse.json(
      { error: "Interview question metadata does not match." },
      { status: 400 },
    );
  if (!parsed.data.mockSessionId && !modeledQuestion)
    return NextResponse.json(
      { error: "Individual interview question metadata is required." },
      { status: 400 },
    );
  if (
    Boolean(parsed.data.mockSessionId) !==
    (parsed.data.mockPosition !== undefined)
  )
    return NextResponse.json(
      { error: "Incomplete mock interview context." },
      { status: 400 },
    );
  if (parsed.data.mockSessionId) {
    const mockPosition = parsed.data.mockPosition!;
    const { data: mock } = await createServiceRoleClient()
      .from("interview_mock_sessions")
      .select("selected_question_ids,current_question_index,status")
      .eq("id", parsed.data.mockSessionId)
      .eq("user_id", profile.id)
      .maybeSingle();
    if (
      !mock ||
      mock.status !== "in_progress" ||
      mock.current_question_index !== mockPosition ||
      mock.selected_question_ids[mockPosition] !== parsed.data.questionId
    )
      return NextResponse.json(
        { error: "This mock interview question is not currently active." },
        { status: 409 },
      );
  }

  const id = crypto.randomUUID();
  const extension = parsed.data.mimeType.includes("mp4") ? "mp4" : "webm";
  const key = `interview-videos/${profile.id}/${id}.${extension}`;
  let upload: Awaited<ReturnType<typeof createInterviewUploadUrl>> = null;
  try {
    upload = await createInterviewUploadUrl(key, parsed.data.mimeType);
  } catch {
    return NextResponse.json(
      { error: "Could not start the secure Cloudflare upload." },
      { status: 503 },
    );
  }
  if (!upload)
    return NextResponse.json(
      { error: "Private Cloudflare video storage is not configured." },
      { status: 503 },
    );

  const db = createServiceRoleClient();
  // Paid access and the allow-listed interview question were validated above.
  // Keep INSERT server-only so students cannot forge lifecycle, storage, or AI
  // fields through the Data API; every protected value is fixed by this route.
  const { error } = await db.from("interview_videos").insert({
    id,
    user_id: profile.id,
    category: category.title,
    question_answered: parsed.data.question,
    mime_type: parsed.data.mimeType,
    duration_seconds: parsed.data.durationSeconds,
    width: parsed.data.width,
    height: parsed.data.height,
    byte_size: parsed.data.byteSize,
    s3_bucket: upload.bucket,
    s3_key: key,
    multipart_upload_id: null,
    recording_metadata: {
      ...parsed.data.metadata,
      storage: "cloudflare-r2",
    },
    status: "uploading",
    question_id: parsed.data.questionId ?? null,
    mock_session_id: parsed.data.mockSessionId ?? null,
    mock_position: parsed.data.mockPosition ?? null,
    individual_result_id: null,
  });
  if (error) {
    return NextResponse.json(
      { error: "Could not save the upload session." },
      { status: 500 },
    );
  }
  return NextResponse.json({
    videoId: id,
    resultId: parsed.data.mockSessionId ?? null,
    resultHref: parsed.data.mockSessionId
      ? `/interview-practice/results/mock/${parsed.data.mockSessionId}`
      : null,
    storageConfigured: true,
    uploadUrl: upload.uploadUrl,
  });
}
