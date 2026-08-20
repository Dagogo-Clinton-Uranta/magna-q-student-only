import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  const query =
    new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  const supabase = await createClient();
  let builder = supabase
    .from("medical_library_entries")
    .select("id,title,slug,summary,content,source_references")
    .eq("status", "live")
    .order("title")
    .limit(20);
  if (query)
    builder = builder.or(
      `title.ilike.%${query.replaceAll(",", "")}%,summary.ilike.%${query.replaceAll(",", "")}%`,
    );
  const { data, error } = await builder;
  if (error)
    return NextResponse.json(
      { error: "Library search failed." },
      { status: 500 },
    );
  return NextResponse.json(
    { entries: data ?? [] },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
