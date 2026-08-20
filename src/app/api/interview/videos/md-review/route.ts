import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePaidStudent } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const requestSchema = z.object({ videoId: z.string().uuid() });

export async function POST(request: Request) {
  const { profile } = await requirePaidStudent("/interview-practice/sessions");
  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid review request." },
      { status: 400 },
    );

  // Charging for a manual review remains a separate concern. This endpoint
  // only records the student's request for the external administration module.
  const { data, error } = await createServiceRoleClient()
    .from("interview_videos")
    .update({ md_review_requested_at: new Date().toISOString() })
    .eq("id", parsed.data.videoId)
    .eq("user_id", profile.id)
    .eq("status", "completed")
    .is("md_review_requested_at", null)
    .select("id")
    .maybeSingle();

  if (error)
    return NextResponse.json(
      { error: "The review request could not be recorded." },
      { status: 500 },
    );
  if (!data)
    return NextResponse.json(
      { error: "This recording is unavailable or already requested." },
      { status: 409 },
    );
  return NextResponse.json({ requested: true });
}
