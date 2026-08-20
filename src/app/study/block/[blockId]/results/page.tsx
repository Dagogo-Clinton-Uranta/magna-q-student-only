import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requirePaidStudent } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { reportQuestionError, saveReviewNote } from "@/app/study/actions";
type ResultQuestion = {
  position: number;
  questionId: string;
  stem: string;
  selectedOptionText: string | null;
  correctOptionText: string;
  isCorrect: boolean | null;
  answered: boolean;
  marked: boolean;
  timeSpentMs: number | null;
  explanation: string;
  educationalObjective: string;
  highYieldSummary: string;
  usSystemContextNote: string | null;
  glossary: Array<{ term: string; definition: string }>;
  rationales: Record<string, string>;
  peerPctCorrect: number | null;
  privateNote: string | null;
};
type Results = {
  summary: {
    total: number;
    answered: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    scorePct: number;
    totalTimeSeconds: number;
    averageTimeMs: number;
    marked: number;
  };
  questions: ResultQuestion[];
  subjects: Array<{
    name: string;
    total: number;
    correct: number;
    score_pct: number;
  }>;
  categories: Array<{
    name: string;
    total: number;
    correct: number;
    score_pct: number;
  }>;
};
export default async function ResultsPage({
  params,
}: {
  params: Promise<{ blockId: string }>;
}) {
  const { blockId } = await params;
  const { profile } = await requirePaidStudent(
    `/study/block/${blockId}/results`,
  );
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("student_block_results", {
    target_block_id: blockId,
  });
  if (error || !data) notFound();
  const results = data as Results;
  return (
    <AppShell title="Block results" name={profile.fullName}>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Score" value={`${results.summary.scorePct}%`} />
        <Metric label="Correct" value={String(results.summary.correct)} />
        <Metric label="Incorrect" value={String(results.summary.incorrect)} />
        <Metric label="Unanswered" value={String(results.summary.unanswered)} />
        <Metric
          label="Total time"
          value={`${Math.ceil(results.summary.totalTimeSeconds / 60)} min`}
        />
        <Metric
          label="Average answered"
          value={`${Math.round(results.summary.averageTimeMs / 1000)} sec`}
        />
        <Metric label="Marked" value={String(results.summary.marked)} />
        <Metric label="Questions" value={String(results.summary.total)} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Breakdown title="Performance by subject" rows={results.subjects} />
        <Breakdown title="Performance by category" rows={results.categories} />
      </div>
      <section className="mt-6">
        <h2 className="text-2xl font-bold">Question review</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {results.questions.map((question) => (
            <a
              key={question.position}
              href={`#question-${question.position}`}
              className={`rounded-lg border p-3 text-center font-bold ${!question.answered ? "border-slate-300 bg-slate-100" : question.isCorrect ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}
            >
              {question.marked ? "★ " : ""}
              {question.position}
            </a>
          ))}
        </div>
        <div className="mt-6 space-y-6">
          {results.questions.map((question) => (
            <article
              id={`question-${question.position}`}
              key={question.position}
              className="scroll-mt-20 rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
            >
              <h3 className="text-lg font-bold">
                Question {question.position}
              </h3>
              <p className="mt-3 whitespace-pre-wrap leading-7">
                {question.stem}
              </p>
              <dl className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase text-slate-500">
                    Your answer
                  </dt>
                  <dd className="mt-1">
                    {question.selectedOptionText ?? "Unanswered"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-slate-500">
                    Correct answer
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {question.correctOptionText}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-slate-500">
                    Time
                  </dt>
                  <dd>
                    {question.timeSpentMs == null
                      ? "—"
                      : `${Math.round(question.timeSpentMs / 1000)} seconds`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-slate-500">
                    Peer comparison
                  </dt>
                  <dd>
                    {question.peerPctCorrect == null
                      ? "Not enough attempts for a reliable comparison."
                      : `${question.peerPctCorrect}% correct`}
                  </dd>
                </div>
              </dl>
              <h4 className="mt-5 font-bold">Explanation</h4>
              <p className="mt-2 whitespace-pre-wrap leading-7">
                {question.explanation}
              </p>
              <h4 className="mt-4 font-bold">Educational objective</h4>
              <p>{question.educationalObjective}</p>
              <h4 className="mt-4 font-bold">High-yield summary</h4>
              <p>{question.highYieldSummary}</p>
              {question.usSystemContextNote && (
                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                  <h4 className="font-bold text-blue-950">
                    US clinical context
                  </h4>
                  <p>{question.usSystemContextNote}</p>
                </div>
              )}
              <details className="mt-5 rounded-lg border border-slate-200 p-4">
                <summary className="cursor-pointer font-semibold text-red-800">
                  Report an error
                </summary>
                <form action={reportQuestionError} className="mt-3">
                  <input
                    type="hidden"
                    name="questionId"
                    value={question.questionId}
                  />
                  <input
                    type="hidden"
                    name="path"
                    value={`/study/block/${blockId}/results`}
                  />
                  <select name="type" className="input">
                    <option value="medical">Medical accuracy</option>
                    <option value="typographical">Typographical</option>
                    <option value="technical">Technical</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    name="text"
                    required
                    minLength={5}
                    maxLength={4000}
                    className="input min-h-24 p-3"
                    placeholder="Describe the issue clearly"
                  />
                  <button className="mt-2 min-h-11 rounded-lg border border-red-300 px-4 font-semibold text-red-800">
                    Submit report
                  </button>
                </form>
              </details>
              <details className="mt-3 rounded-lg border border-slate-200 p-4">
                <summary className="cursor-pointer font-semibold">
                  Private note
                </summary>
                <form action={saveReviewNote} className="mt-3">
                  <input
                    type="hidden"
                    name="questionId"
                    value={question.questionId}
                  />
                  <input
                    type="hidden"
                    name="path"
                    value={`/study/block/${blockId}/results`}
                  />
                  <textarea
                    name="note"
                    maxLength={10000}
                    defaultValue={question.privateNote ?? ""}
                    className="input min-h-24 p-3"
                  />
                  <button className="mt-2 min-h-11 rounded-lg border border-slate-300 px-4 font-semibold">
                    Save note
                  </button>
                </form>
              </details>
            </article>
          ))}
        </div>
      </section>
      <Link
        href="/study/create"
        className="mt-8 inline-flex min-h-11 items-center font-bold text-blue-800"
      >
        Create another block
      </Link>
    </AppShell>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    name: string;
    total: number;
    correct: number;
    score_pct: number;
  }>;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <ul className="mt-3 space-y-3">
        {rows.map((row) => (
          <li key={row.name}>
            <div className="flex justify-between text-sm">
              <span>{row.name}</span>
              <strong>
                {row.correct}/{row.total} · {row.score_pct}%
              </strong>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-700"
                style={{ width: `${row.score_pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
