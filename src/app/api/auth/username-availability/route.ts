import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usernameSchema } from "@/lib/validation/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const candidate = new URL(request.url).searchParams.get("username");
  const parsed = usernameSchema.safeParse(candidate);
  if (!parsed.success)
    return NextResponse.json(
      { available: false, message: "Choose a valid username." },
      { status: 400 },
    );

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("username_available", {
    candidate: parsed.data,
  });
  if (error)
    return NextResponse.json(
      { available: false, message: "Availability could not be checked." },
      { status: 503 },
    );
  return NextResponse.json(
    {
      available: data === true,
      message: data === true ? undefined : "That username is already taken.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
