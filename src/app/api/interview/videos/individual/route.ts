import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Please refresh the page before uploading your recording.",
    },
    { status: 410 },
  );
}
