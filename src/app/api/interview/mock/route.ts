import { NextResponse } from "next/server";
import { z } from "zod";
import {
  interviewQuestions,
  interviewSpecialties,
} from "@/lib/interview/questions";
import { selectMockInterviewQuestions } from "@/lib/interview/mock-selection";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getInterviewStorageConfig } from "@/lib/interview/storage";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const specialtyIds = interviewSpecialties.map((specialty) => specialty.id) as [
  (typeof interviewSpecialties)[number]["id"],
  ...(typeof interviewSpecialties)[number]["id"][],
];

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/interview-practice/mock");
  if (!access.ok) return access.response;
  if (!(await checkRateLimit("interview-mock-create", access.profile.id, request, 5, 3600)))
    return NextResponse.json({ error: "Mock interview start limit reached. Please try again later." }, { status: 429 });
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
  const { data, error } = await createServiceRoleClient()
    .from("interview_mock_sessions")
    .insert({
      user_id: access.profile.id,
      specialty: parsed.data.specialty,
      selected_question_ids: selected.map((question) => question.id),
      status: "in_progress",
      current_question_index: 0,
    })
    .select("id")
    .single();
  if (error || !data)
    return NextResponse.json(
      { error: "The mock interview could not be started." },
      { status: 500 },
    );
  return NextResponse.json({
    sessionId: data.id,
    href: `/interview-practice/mock/${data.id}/0`,
  });
}
