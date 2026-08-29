import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { InterviewRecorder } from "@/components/interview/interview-recorder";
import { requirePaidStudent } from "@/lib/auth/guards";
import { getInterviewQuestion } from "@/lib/interview/questions";
import { createClient } from "@/lib/supabase/server";

export default async function ActiveMockQuestionPage({
  params,
}: {
  params: Promise<{ id: string; position: string }>;
}) {
  const { id, position: rawPosition } = await params;
  const returnTo = `/interview-practice/mock/${encodeURIComponent(id)}/${encodeURIComponent(rawPosition)}`;
  const { profile } = await requirePaidStudent(returnTo);
  const position = Number(rawPosition);
  if (!Number.isInteger(position) || position < 0 || position > 7) notFound();
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("interview_mock_sessions")
    .select("id,specialty,status,selected_question_ids,current_question_index")
    .eq("id", id)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!session) notFound();
  if (session.status !== "in_progress" || session.current_question_index >= 8)
    redirect(`/interview-practice/results/mock/${session.id}`);
  if (position !== session.current_question_index)
    redirect(
      `/interview-practice/mock/${session.id}/${session.current_question_index}`,
    );
  const question = getInterviewQuestion(
    session.selected_question_ids[position],
  );
  if (!question) notFound();
  const nextHref =
    position === 7
      ? `/interview-practice/results/mock/${session.id}`
      : `/interview-practice/mock/${session.id}/${position + 1}`;

  return (
    <AppShell title="Mock interview" name={profile.fullName}>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-800">
              Active mock · Question {position + 1} of 8
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {session.specialty.replaceAll("-", " ")} · Complete this answer to
              continue
            </p>
          </div>
          <Link
            href="/interview-practice"
            className="text-sm font-bold text-slate-700"
          >
            Exit mock
          </Link>
        </div>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
          aria-label={`${position} of 8 answers submitted`}
        >
          <div
            className="h-full bg-blue-800"
            style={{ width: `${(position / 8) * 100}%` }}
          />
        </div>
      </div>
      <InterviewRecorder
        categorySlug={question.legacyCategorySlug}
        categoryTitle={question.legacyCategoryTitle}
        questionId={question.id}
        question={question.text}
        mockSessionId={session.id}
        mockPosition={position}
        nextHref={nextHref}
      />
    </AppShell>
  );
}
