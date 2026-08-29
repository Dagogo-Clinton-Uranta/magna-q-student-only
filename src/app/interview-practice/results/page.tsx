import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { requirePaidStudent } from "@/lib/auth/guards";
import { getInterviewPracticeArea } from "@/lib/interview/questions";
import { createClient } from "@/lib/supabase/server";

export default async function InterviewResultsPage() {
  const { profile } = await requirePaidStudent("/interview-practice/results");
  const supabase = await createClient();
  const [
    { data: mocks },
    { data: individual },
    { data: pendingMocks },
    { data: pendingIndividual },
  ] = await Promise.all([
    supabase
      .from("interview_mock_sessions")
      .select(
        "id,specialty,completed_at,practice_assessment,assessment_label,strongest_competencies,priority_development_competencies,selected_question_ids",
      )
      .eq("user_id", profile.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(5),
    supabase
      .from("interview_individual_results")
      .select(
        "id,question_text,practice_area,completed_at,practice_assessment,assessment_label,strongest_competency,priority_development_competency",
      )
      .eq("user_id", profile.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(5),
    supabase
      .from("interview_mock_sessions")
      .select("id,specialty,status,submitted_at,current_question_index")
      .eq("user_id", profile.id)
      .in("status", ["in_progress", "awaiting_evaluation"])
      .order("started_at", { ascending: false })
      .limit(5),
    supabase
      .from("interview_individual_results")
      .select("id,question_text,status,created_at")
      .eq("user_id", profile.id)
      .in("status", ["in_progress", "awaiting_evaluation", "failed"])
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  return (
    <AppShell title="Recent interview results" name={profile.fullName}>
      <WorkspaceHero image="journey" className="mt-5">
        <p className="eyebrow">Latest five results per practice mode</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Review recent practice, not predicted performance
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Completed mock and individual results are retained independently.
          In-progress work does not count toward either five-result limit.
        </p>
      </WorkspaceHero>
      {Boolean(pendingMocks?.length || pendingIndividual?.length) && (
        <section className="mt-7 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="text-lg font-bold text-blue-950">Processing and unfinished practice</h2>
          <ul className="mt-3 space-y-2 text-sm text-blue-900">
            {(pendingMocks ?? []).map((item) => (
              <li key={item.id}>
                <Link className="font-bold underline" href={item.status === "in_progress" ? `/interview-practice/mock/${item.id}/${item.current_question_index}` : `/interview-practice/results/mock/${item.id}`}>
                  {String(item.specialty).replaceAll("-", " ")} mock
                </Link>{" "}— {item.status === "awaiting_evaluation" ? "submitted and being analysed; you may leave and return later" : `${item.current_question_index} of 8 submitted`}
              </li>
            ))}
            {(pendingIndividual ?? []).map((item) => <li key={item.id}>{item.question_text} — {item.status === "failed" ? "analysis failed; return to the practice question to retry your local recording" : "processing your answer"}</li>)}
          </ul>
        </section>
      )}
      {(mocks ?? []).filter((result) => result.practice_assessment).length >=
        2 && (
        <section className="mt-7 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Recent Practice Trend</h2>
          <p className="mt-1 text-sm text-slate-600">
            Your latest completed mock Practice Assessments, shown oldest to
            newest. This is a practice history, not predicted residency
            performance.
          </p>
          <div
            className="mt-5 flex h-44 items-end gap-3"
            role="img"
            aria-label="Recent mock interview Practice Assessment trend"
          >
            {[...(mocks ?? [])]
              .filter((result) => result.practice_assessment)
              .reverse()
              .map((result) => {
                const score = Number(result.practice_assessment);
                return (
                  <div
                    key={result.id}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-xs font-bold text-slate-700">
                      {score.toFixed(1)}
                    </span>
                    <div
                      className="w-full max-w-16 rounded-t bg-blue-800"
                      style={{ height: `${(score / 5) * 100}%` }}
                    />
                    <span className="text-xs text-slate-500">
                      {shortDate(result.completed_at)}
                    </span>
                  </div>
                );
              })}
          </div>
        </section>
      )}
      <ResultSection
        title="Mock Interviews"
        empty="No mock interview results yet."
        cta="Take Your First Mock Interview"
        href="/interview-practice/mock"
      >
        {(mocks ?? []).map((result) => (
          <article
            key={result.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-800">
                  {String(result.specialty).replaceAll("-", " ")}
                </p>
                <h3 className="mt-1 text-xl font-bold">
                  Practice Assessment: {result.assessment_label ?? "Completed"}
                </h3>
              </div>
              <p className="text-sm text-slate-500">
                {formatDate(result.completed_at)}
              </p>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <Stat
                label="Assessment"
                value={
                  result.practice_assessment
                    ? `${Number(result.practice_assessment).toFixed(1)}/5`
                    : "Not scored"
                }
              />
              <Stat
                label="Strongest competency"
                value={firstLabel(result.strongest_competencies)}
              />
              <Stat
                label="Priority development"
                value={firstLabel(result.priority_development_competencies)}
              />
            </dl>
            <p className="mt-4 text-sm text-slate-600">
              {result.selected_question_ids?.length ?? 8} questions completed
            </p>
            <Link
              href={`/interview-practice/results/mock/${result.id}`}
              className="mt-4 inline-block font-bold text-blue-800"
            >
              View Full Results →
            </Link>
          </article>
        ))}
      </ResultSection>
      <ResultSection
        title="Individual Practice"
        empty="No individual practice results yet."
        cta="Start Practicing"
        href="/interview-practice/sessions"
      >
        {(individual ?? []).map((result) => (
          <article
            key={result.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
              {getInterviewPracticeArea(result.practice_area)?.title ??
                result.practice_area}
            </p>
            <h3 className="mt-2 text-lg font-bold">{result.question_text}</h3>
            <p className="mt-2 text-sm text-slate-500">
              {formatDate(result.completed_at)}
            </p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <Stat
                label="Practice Assessment"
                value={
                  result.practice_assessment
                    ? `${Number(result.practice_assessment).toFixed(1)}/5`
                    : "Not scored"
                }
              />
              <Stat
                label="Strongest area"
                value={areaLabel(result.strongest_competency)}
              />
              <Stat
                label="Development area"
                value={areaLabel(result.priority_development_competency)}
              />
            </dl>
            <Link
              href={`/interview-practice/results/practice/${result.id}`}
              className="mt-4 inline-block font-bold text-blue-800"
            >
              View Full Feedback →
            </Link>
          </article>
        ))}
      </ResultSection>
    </AppShell>
  );
}

function ResultSection({
  title,
  empty,
  cta,
  href,
  children,
}: {
  title: string;
  empty: string;
  cta: string;
  href: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="mt-9">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4 space-y-4">
        {children.length ? (
          children
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-slate-600">{empty}</p>
            <Link href={href} className="button-primary mt-4">
              {cta}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-900">{value}</dd>
    </div>
  );
}
function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "Date unavailable";
}
function shortDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
        new Date(value),
      )
    : "—";
}
function areaLabel(value: unknown) {
  return typeof value === "string"
    ? (getInterviewPracticeArea(value)?.title ?? value)
    : "Not available";
}
function firstLabel(value: unknown) {
  return Array.isArray(value) && value.length
    ? areaLabel(
        typeof value[0] === "string" ? value[0] : value[0]?.competencyId,
      )
    : "Not available";
}
