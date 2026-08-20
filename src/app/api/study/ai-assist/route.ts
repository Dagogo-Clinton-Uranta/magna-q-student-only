import { NextResponse } from "next/server";
import { z } from "zod";
import { createQuestionAssistProvider } from "@/lib/ai/provider";
import { AiProviderNotConfiguredError } from "@/lib/ai/types";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";

const requestSchema = z.object({
  blockId: z.string().uuid(),
  position: z.number().int().positive(),
});

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/create-test");
  if (!access.ok) return access.response;
  const { profile } = access;
  if (!(await checkRateLimit("ai-assist", profile.id, request, 20, 3600)))
    return NextResponse.json(
      { error: "AI assist limit reached. Try again later." },
      { status: 429 },
    );

  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("student_get_block_question", {
    target_block_id: parsed.data.blockId,
    target_position: parsed.data.position,
  });
  if (error || !data)
    return NextResponse.json(
      { error: "Question unavailable." },
      { status: 404 },
    );

  const question = data as { stem?: unknown; keyPhrases?: unknown };
  if (typeof question.stem !== "string")
    return NextResponse.json(
      { error: "Question unavailable." },
      { status: 404 },
    );

  try {
    const provider = createQuestionAssistProvider();
    const result = await provider.provideSecondOpinion({
      stem: question.stem,
      keyPhrases: Array.isArray(question.keyPhrases)
        ? question.keyPhrases.filter(
            (phrase): phrase is string => typeof phrase === "string",
          )
        : [],
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (providerError) {
    if (providerError instanceof AiProviderNotConfiguredError)
      return NextResponse.json(
        {
          error:
            "AI assist is ready for a provider key but is not configured yet.",
        },
        { status: 503 },
      );
    return NextResponse.json(
      { error: "AI assist is temporarily unavailable." },
      { status: 502 },
    );
  }
}
