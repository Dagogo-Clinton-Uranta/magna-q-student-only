import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getInterviewVideoUrl } from "@/lib/interview/storage";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getCurrentProfile();
  if (!profile)
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const { id } = await params;
  const supabase = await createClient();
  const query = supabase
    .from("interview_videos")
    .select("s3_key")
    .eq("id", id)
    .eq("user_id", profile.id);
  const { data } = await query.maybeSingle();
  if (!data?.s3_key)
    return NextResponse.json(
      { error: "This recording is not available." },
      { status: 404 },
    );
  const signedUrl = await getInterviewVideoUrl(data.s3_key);
  if (!signedUrl)
    return NextResponse.json(
      { error: "Video storage is not configured." },
      { status: 503 },
    );
  return NextResponse.redirect(signedUrl);
}
