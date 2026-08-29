import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadVideoPart } from "@/lib/interview/storage";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const access = await getPaidStudentApiAccess("/interview-practice/sessions");
  if (!access.ok) return access.response;
  const { profile } = access;
  if (!(await checkRateLimit("interview-mock-chunk", profile.id, request, 200, 3600)))
    return NextResponse.json({ error: "Video upload limit reached. Please try again later." }, { status: 429 });
  const url = new URL(request.url);
  const parsed = z
    .object({
      videoId: z.string().uuid(),
      partNumber: z.coerce.number().int().min(1).max(10_000),
    })
    .safeParse({
      videoId: url.searchParams.get("videoId"),
      partNumber: url.searchParams.get("partNumber"),
    });
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid chunk request." },
      { status: 400 },
    );
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!contentLength || contentLength > 6 * 1024 * 1024)
    return NextResponse.json(
      { error: "Chunk must be between 1 byte and 6 MB." },
      { status: 413 },
    );

  const supabase = await createClient();
  const { data: video } = await supabase
    .from("interview_videos")
    .select("id,s3_key,multipart_upload_id,upload_parts,status")
    .eq("id", parsed.data.videoId)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (
    !video ||
    video.status !== "uploading" ||
    !video.s3_key ||
    !video.multipart_upload_id
  )
    return NextResponse.json(
      { error: "Upload session not found." },
      { status: 404 },
    );
  try {
    const body = Buffer.from(await request.arrayBuffer());
    const etag = await uploadVideoPart({
      key: video.s3_key,
      uploadId: video.multipart_upload_id,
      partNumber: parsed.data.partNumber,
      body,
    });
    const existing = Array.isArray(video.upload_parts)
      ? video.upload_parts
      : [];
    const next = [
      ...existing.filter(
        (part: { PartNumber?: number }) =>
          part.PartNumber !== parsed.data.partNumber,
      ),
      { PartNumber: parsed.data.partNumber, ETag: etag },
    ];
    // The paid user client already proved ownership and uploading status above.
    // Direct student UPDATE is intentionally absent from RLS, so only this
    // trusted server route may persist the exact storage progress it produced.
    const { data: updated, error } = await createServiceRoleClient()
      .from("interview_videos")
      .update({ upload_parts: next })
      .eq("id", video.id)
      .eq("user_id", profile.id)
      .eq("status", "uploading")
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!updated) throw new Error("Upload session is no longer active.");
    return NextResponse.json({
      uploaded: true,
      partNumber: parsed.data.partNumber,
    });
  } catch {
    return NextResponse.json(
      { error: "Chunk upload failed. It is safe to retry this part." },
      { status: 503 },
    );
  }
}
