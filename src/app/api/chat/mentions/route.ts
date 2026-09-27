import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!/^[a-z0-9_]{0,24}$/i.test(query)) {
    return NextResponse.json({ suggestions: [] }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("chat_mention_suggestions", {
    p_query: query.toLowerCase(),
  });
  if (error) {
    return NextResponse.json(
      { suggestions: [], error: "Suggestions could not be loaded." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      suggestions: (data ?? []).map(
        (item: { username: string }) => item.username,
      ),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
