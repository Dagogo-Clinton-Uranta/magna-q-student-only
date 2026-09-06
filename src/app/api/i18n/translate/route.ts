import { NextResponse } from "next/server";
import { z } from "zod";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { translateAutomatically } from "@/lib/i18n/automatic-translation";

export const runtime = "nodejs";

const requestSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  texts: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        text: z.string().min(1).max(16_000),
      }),
    )
    .min(1)
    .max(50),
});

const requestWindows = new Map<string, { startedAt: number; count: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;

function isAllowed(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const key = forwarded?.trim() || request.headers.get("x-real-ip") || "local";
  const now = Date.now();
  const window = requestWindows.get(key);
  if (!window || now - window.startedAt >= WINDOW_MS) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return true;
  }
  window.count += 1;
  return window.count <= MAX_REQUESTS_PER_WINDOW;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  if (!isAllowed(request)) {
    return NextResponse.json(
      { error: "Translation is temporarily rate limited." },
      { status: 429 },
    );
  }

  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid translation request." },
      { status: 400 },
    );
  }

  const uniqueIds = new Set(parsed.data.texts.map((item) => item.id));
  const totalCharacters = parsed.data.texts.reduce(
    (total, item) => total + item.text.length,
    0,
  );
  if (uniqueIds.size !== parsed.data.texts.length || totalCharacters > 16_000) {
    return NextResponse.json(
      { error: "Translation batch is too large or contains duplicate ids." },
      { status: 400 },
    );
  }

  try {
    const translations = await translateAutomatically(
      parsed.data.locale,
      parsed.data.texts,
    );
    return NextResponse.json(
      { translations },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Automatic translation is temporarily unavailable.",
      },
      { status: 502 },
    );
  }
}
