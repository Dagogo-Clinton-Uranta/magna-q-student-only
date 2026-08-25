import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { featureIdSchema, mentionQuerySchema } from "@/lib/features/validation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  const featureId = featureIdSchema.safeParse(
    request.nextUrl.searchParams.get("featureId") ?? "",
  );
  const query = mentionQuerySchema.safeParse(
    request.nextUrl.searchParams.get("q") ?? "",
  );
  if (!featureId.success || !query.success)
    return NextResponse.json(
      { error: "Invalid mention query." },
      { status: 400 },
    );

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("feature_mention_suggestions", {
    p_feature_id: featureId.data,
    p_query: query.data,
  });
  if (error) {
    console.error("Could not load feature mention suggestions.", error);
    return NextResponse.json(
      { error: "Could not load suggestions." },
      { status: 500 },
    );
  }
  return NextResponse.json({ suggestions: data ?? [] });
}
