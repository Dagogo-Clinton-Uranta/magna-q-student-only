import { NextResponse } from "next/server";
import { z } from "zod";
import {
  interviewQuestions,
  interviewSpecialties,
} from "@/lib/interview/questions";
import { selectMockInterviewQuestions } from "@/lib/interview/mock-selection";
import { getInterviewStudentApiAccess } from "@/lib/payments/api-access";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getInterviewStorageConfig } from "@/lib/interview/storage";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const specialtyIds = interviewSpecialties.map((specialty) => specialty.id) as [
  (typeof interviewSpecialties)[number]["id"],
  ...(typeof interviewSpecialties)[number]["id"][],
];

export async function POST(request: Request) {
  const access = await getInterviewStudentApiAccess();
  if (!access.ok) return access.response;
  if (
    !(await checkRateLimit(
      "interview-mock-create",
      access.profile.id,
      request,
      5,
      3600,
    ))
  )
    return NextResponse.json(
      { error: "Mock interview start limit reached. Please try again later." },
      { status: 429 },
    );
  if (
    !getInterviewStorageConfig() ||
    !process.env.REDIS_URL ||
    !process.env.DEEPGRAM_API_KEY ||
    !process.env.OPENAI_API_KEY
  )
    return NextResponse.json(
      {
        error:
          "Mock interviews are temporarily unavailable until private video storage and analysis workers are configured.",
      },
      { status: 503 },
    );
  const parsed = z
    .object({ specialty: z.enum(specialtyIds) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Choose a valid specialty." },
      { status: 400 },
    );

  const selected = selectMockInterviewQuestions({
    questions: interviewQuestions,
    specialty: parsed.data.specialty,
  });
  const sessionId = crypto.randomUUID();
  const { data, error } = await createServiceRoleClient().rpc(
    "create_billed_mock_interview",
    {
      target_session_id: sessionId,
      target_user_id: access.profile.id,
      target_specialty: parsed.data.specialty,
      target_question_ids: selected.map((question) => question.id),
    },
  );
  if (error)
    return NextResponse.json(
      { error: "The mock interview could not be started." },
      { status: 500 },
    );
  const credit = data as { allowed?: boolean; mock_remaining?: number } | null;
  if (!credit?.allowed)
    return NextResponse.json(
      {
        error:
          "A $5 mock interview credit is required to begin this eight-question session.",
        code: "INTERVIEW_CREDIT_REQUIRED",
        paywallUrl:
          "/interview-practice/credits?product=mock_interview&returnTo=%2Finterview-practice%2Fmock",
      },
      { status: 402 },
    );
  return NextResponse.json({
    sessionId,
    href: `/interview-practice/mock/${sessionId}/0`,
    mockCreditsRemaining: credit.mock_remaining ?? 0,
  });
}
