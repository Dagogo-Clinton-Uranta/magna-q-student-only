import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CompetencyProfile } from "@/components/interview/competency-profile";
import { DeliveryInsights } from "@/components/interview/delivery-insights";
import { requirePaidStudent } from "@/lib/auth/guards";
import {
  getInterviewPracticeArea,
  getInterviewQuestion,
} from "@/lib/interview/questions";
import { createClient } from "@/lib/supabase/server";

export default async function IndividualResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const returnTo = `/interview-practice/results/practice/${encodeURIComponent(id)}`;
  const { profile } = await requirePaidStudent(returnTo);
  const supabase = await createClient();
  const { data: result } = await supabase
    .from("interview_individual_results")
    .select("*")
    .eq("id", id)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!result) notFound();
  const [
    { data: evaluation },
    { data: aggregates },
    { data: recommendations },
    { data: video },
    { data: processing },
  ] = await Promise.all([
    supabase
      .from("interview_question_evaluations")
      .select("*")
      .eq("individual_result_id", id)
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase
      .from("interview_competency_aggregates")
      .select("competency_id,score,questions_assessed")
      .eq("individual_result_id", id)
      .eq("user_id", profile.id),
    supabase
      .from("interview_result_recommendations")
      .select("question_id,rank,reason_competency_id")
      .eq("individual_result_id", id)
      .eq("user_id", profile.id)
      .order("rank"),
    supabase
      .from("interview_videos")
      .select("id,s3_key")
      .eq("individual_result_id", id)
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase
      .from("interview_processing_answers")
      .select("status,delivery_metrics,user_error_message")
      .eq("individual_result_id", id)
      .eq("user_id", profile.id)
      .maybeSingle(),
  ]);
  return (
    <AppShell title="Individual practice feedback" name={profile.fullName}>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
          {getInterviewPracticeArea(result.practice_area)?.title ??
            result.practice_area}{" "}
          · {result.question_type}
        </p>
        <h2 className="mt-2 text-2xl font-bold">{result.question_text}</h2>
        <p className="mt-2 text-sm text-slate-500">
          {formatDate(result.completed_at)} ·{" "}
          {String(result.specialty).replaceAll("-", " ")}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {video?.s3_key && (
            <Link
              href={`/api/interview/videos/${video.id}/playback`}
              className="button-secondary"
            >
              View recording
            </Link>
          )}
          {getInterviewQuestion(result.question_id) && (
            <PracticeAgain questionId={result.question_id} />
          )}
        </div>
      </div>
      {result.status !== "completed" && (
        <section className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
          <h3 className="font-bold">Your answer is being analysed</h3>
          <p className="mt-2 text-sm leading-6">
            Your recording is securely stored in Cloudflare R2. You may visit
            other screens and return to Interview Results whenever you are
            ready. A notification will appear when the analysis is complete.
          </p>
        </section>
      )}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Practice Assessment
        </p>
        <p className="mt-2 text-3xl font-black text-blue-950">
          {result.practice_assessment
            ? `${Number(result.practice_assessment).toFixed(1)}/5`
            : "Not assessed"}
        </p>
        <p className="mt-1 text-slate-600">
          {result.assessment_label ??
            "No authoritative assessment is available."}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Rubric:{" "}
          {result.rubric_key && result.rubric_version
            ? `${result.rubric_key} · version ${result.rubric_version}`
            : "Not assigned"}
        </p>
      </section>
      <DeliveryInsights metrics={processing?.delivery_metrics} />
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-bold">Competencies Assessed</h3>
        <div className="mt-5">
          <CompetencyProfile
            items={(aggregates ?? []).map((item) => ({
              ...item,
              score: Number(item.score),
            }))}
          />
        </div>
      </section>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-bold">Structured Feedback</h3>
        {evaluation ? (
          <Evaluation evaluation={evaluation} />
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            No finalized rubric evaluation is stored for this response.
          </p>
        )}
      </section>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-bold">Recommended Questions</h3>
        {(recommendations ?? []).length ? (
          <ul className="mt-4 space-y-3">
            {recommendations!.map((item) => {
              const question = getInterviewQuestion(item.question_id);
              return question ? (
                <li key={item.question_id}>
                  <Link
                    href={`/interview-practice/sessions/${question.legacyCategorySlug}/${question.legacyQuestionIndex}`}
                    className="font-bold text-blue-800"
                  >
                    {question.text}
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Recommendations require a finalized competency evaluation.
          </p>
        )}
      </section>
      <Link
        href="/interview-practice/results"
        className="button-secondary mt-6"
      >
        View Recent Results
      </Link>
    </AppShell>
  );
}

function Evaluation({ evaluation }: { evaluation: Record<string, unknown> }) {
  const strengths = strings(evaluation.strengths);
  const improvements = strings(evaluation.improvements);
  const scores = objects(evaluation.competency_scores);
  return (
    <div className="mt-4 space-y-5 text-sm leading-6 text-slate-700">
      {typeof evaluation.transcript === "string" && evaluation.transcript && (
        <details>
          <summary className="cursor-pointer font-bold text-blue-800">
            Transcript
          </summary>
          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-4">
            {evaluation.transcript}
          </p>
        </details>
      )}
      <Feedback
        title="Evidence and scores"
        items={scores.map(
          (score) =>
            `${getInterviewPracticeArea(String(score.competencyId))?.title ?? String(score.competencyId)}: ${String(score.score)}/5${score.evidence ? ` — ${String(score.evidence)}` : ""}`,
        )}
      />
      <Feedback title="Strengths" items={strengths} />
      <Feedback title="Development areas" items={improvements} />
    </div>
  );
}
function Feedback({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-bold">{title}</h4>
      {items.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-slate-500">None recorded.</p>
      )}
    </div>
  );
}
function PracticeAgain({ questionId }: { questionId: string }) {
  const question = getInterviewQuestion(questionId)!;
  return (
    <Link
      className="button-primary"
      href={`/interview-practice/sessions/${question.legacyCategorySlug}/${question.legacyQuestionIndex}`}
    >
      Practice Again
    </Link>
  );
}
function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
function objects(value: unknown) {
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
    : "Date unavailable";
}
