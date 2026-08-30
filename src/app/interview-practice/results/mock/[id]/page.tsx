import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CompetencyProfile } from "@/components/interview/competency-profile";
import { DeliveryInsights } from "@/components/interview/delivery-insights";
import { ProcessingRetry } from "@/components/interview/processing-retry";
import { requirePaidStudent } from "@/lib/auth/guards";
import {
  getInterviewPracticeArea,
  getInterviewQuestion,
} from "@/lib/interview/questions";
import { createClient } from "@/lib/supabase/server";

export default async function FullMockResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const returnTo = `/interview-practice/results/mock/${encodeURIComponent(id)}`;
  const { profile } = await requirePaidStudent(returnTo);
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("interview_mock_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!session) notFound();
  const [
    { data: evaluations },
    { data: aggregates },
    { data: recommendations },
    { data: processingAnswers },
  ] = await Promise.all([
    supabase
      .from("interview_question_evaluations")
      .select("*")
      .eq("mock_session_id", id)
      .eq("user_id", profile.id)
      .order("mock_position"),
    supabase
      .from("interview_competency_aggregates")
      .select("competency_id,score,questions_assessed")
      .eq("mock_session_id", id)
      .eq("user_id", profile.id)
      .order("score", { ascending: false }),
    supabase
      .from("interview_result_recommendations")
      .select("question_id,rank,reason_competency_id")
      .eq("mock_session_id", id)
      .eq("user_id", profile.id)
      .order("rank"),
    supabase
      .from("interview_processing_answers")
      .select("id,question_id,status,delivery_metrics,user_error_message")
      .eq("mock_session_id", id)
      .eq("user_id", profile.id),
  ]);
  const completed = session.status === "completed";
  const selectedQuestions = (session.selected_question_ids as string[])
    .map(getInterviewQuestion)
    .filter(Boolean);

  return (
    <AppShell title="Mock interview results" name={profile.fullName}>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-800">
            {String(session.specialty).replaceAll("-", " ")} mock interview
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {completed ? "Competency scorecard" : "Mock interview submitted"}
          </h2>
          <p className="mt-2 text-slate-600">
            Started {formatDate(session.started_at)} ·{" "}
            {processingAnswers?.length ?? 0} of 8 answers submitted
          </p>
        </div>
        <Link href="/interview-practice/mock" className="button-primary">
          Take Another Mock Interview
        </Link>
      </div>

      {!completed && (
        <section className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
          <h3 className="font-bold">Your mock interview is being analysed</h3>
          <p className="mt-2 text-sm leading-6">
            Each accepted recording is securely stored in Cloudflare R2 and
            processed with retry protection. You may visit other screens and
            return to Interview Results whenever you are ready. A notification
            will appear after all eight valid evaluations are complete.
          </p>
        </section>
      )}

      <section className="mt-7 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Overall Practice Assessment
        </p>
        <p className="mt-2 text-3xl font-black text-blue-950">
          {session.practice_assessment
            ? `${Number(session.practice_assessment).toFixed(1)}/5`
            : "Not yet assessed"}
        </p>
        <p className="mt-1 text-slate-600">
          {session.assessment_label ??
            "A label will be derived deterministically from finalized competency evaluations."}
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-bold">Competency Profile</h3>
        <div className="mt-5">
          <CompetencyProfile
            items={(aggregates ?? []).map((item) => ({
              ...item,
              score: Number(item.score),
            }))}
          />
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <SummaryList
          title="Strongest Competencies"
          items={competencyNames(session.strongest_competencies)}
          empty="No competencies have been sufficiently assessed."
        />
        <SummaryList
          title="Priority Development Areas"
          items={competencyNames(session.priority_development_competencies)}
          empty="No development priorities have been calculated."
        />
      </div>

      <section className="mt-8">
        <h3 className="text-2xl font-bold">Question-by-Question Feedback</h3>
        <div className="mt-4 space-y-3">
          {selectedQuestions.map((question, index) => {
            const evaluation = (evaluations ?? []).find(
              (item) => item.question_id === question!.id,
            );
            return (
              <details
                key={question!.id}
                className="rounded-xl border border-slate-200 bg-white"
              >
                <summary className="cursor-pointer p-5 font-bold">
                  {index + 1}. {question!.text}
                </summary>
                <div className="border-t border-slate-100 p-5 text-sm leading-6 text-slate-700">
                  <div className="flex flex-wrap gap-2 capitalize">
                    <Tag>{question!.questionType}</Tag>
                    <Tag>
                      {getInterviewPracticeArea(question!.practiceArea)
                        ?.title ?? question!.practiceArea}
                    </Tag>
                  </div>
                  {evaluation ? (
                    <>
                      <EvaluationDetails evaluation={evaluation} />
                      <DeliveryInsights
                        metrics={
                          processingAnswers?.find(
                            (item) => item.question_id === question!.id,
                          )?.delivery_metrics
                        }
                      />
                    </>
                  ) : (
                    <div className="mt-4 text-slate-600">
                      <p>
                        {processingAnswers?.find(
                          (item) => item.question_id === question!.id,
                        )?.user_error_message ??
                          "Recording submitted; rubric evaluation has not been finalized."}
                      </p>
                      {processingAnswers?.find(
                        (item) => item.question_id === question!.id,
                      )?.status === "FAILED" && (
                        <ProcessingRetry
                          answerId={
                            processingAnswers.find(
                              (item) => item.question_id === question!.id,
                            )!.id
                          }
                        />
                      )}
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-bold">Recommended Practice</h3>
        {(recommendations ?? []).length ? (
          <ol className="mt-4 space-y-3">
            {recommendations!.map((item, index) => {
              const question = getInterviewQuestion(item.question_id);
              return question ? (
                <li key={item.question_id}>
                  <Link
                    className="font-bold text-blue-800"
                    href={`/interview-practice/sessions/${question.legacyCategorySlug}/${question.legacyQuestionIndex}`}
                  >
                    {index + 1}. {question.text}
                  </Link>
                  <p className="text-sm text-slate-500">
                    Focus:{" "}
                    {getInterviewPracticeArea(item.reason_competency_id)
                      ?.title ?? item.reason_competency_id}
                  </p>
                </li>
              ) : null;
            })}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Recommendations will appear after enough competencies have been
            assessed.
          </p>
        )}
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/interview-practice/results" className="button-secondary">
          View Recent Results
        </Link>
        <Link href="/interview-practice/sessions" className="button-primary">
          Practice Again
        </Link>
      </div>
    </AppShell>
  );
}

function EvaluationDetails({
  evaluation,
}: {
  evaluation: Record<string, unknown>;
}) {
  const strengths = stringArray(evaluation.strengths);
  const improvements = stringArray(evaluation.improvements);
  const scores = objectArray(evaluation.competency_scores);
  return (
    <div className="mt-4 space-y-4">
      {typeof evaluation.transcript === "string" && evaluation.transcript && (
        <details>
          <summary className="cursor-pointer font-bold text-blue-800">
            View transcript
          </summary>
          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-4">
            {evaluation.transcript}
          </p>
        </details>
      )}
      <div>
        <h4 className="font-bold">Competency evidence</h4>
        {scores.length ? (
          <ul className="mt-2 space-y-2">
            {scores.map((score, index) => (
              <li key={index}>
                {String(score.competencyId ?? "Competency")}:{" "}
                {String(score.score ?? "—")}/5
                {score.evidence ? ` — ${String(score.evidence)}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1">Not assessed.</p>
        )}
      </div>
      <SummaryList
        title="Strengths"
        items={strengths}
        empty="No strengths recorded."
      />
      <SummaryList
        title="Development areas"
        items={improvements}
        empty="No development feedback recorded."
      />
    </div>
  );
}
function SummaryList({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="font-bold">{title}</h3>
      {items.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-600">{empty}</p>
      )}
    </section>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
      {children}
    </span>
  );
}
function competencyNames(value: unknown) {
  return stringArray(value).map(
    (id) => getInterviewPracticeArea(id)?.title ?? id,
  );
}
function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
function objectArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object",
      )
    : [];
}
function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "date unavailable";
}
