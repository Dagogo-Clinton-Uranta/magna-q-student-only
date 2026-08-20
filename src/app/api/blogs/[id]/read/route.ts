import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getCurrentProfile();
  if (!profile)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.rpc("record_blog_post_read", {
    target_blog_post_id: id,
  });
  if (error)
    return NextResponse.json(
      { error: "Read could not be recorded." },
      { status: 400 },
    );
  return new NextResponse(null, { status: 204 });
}
