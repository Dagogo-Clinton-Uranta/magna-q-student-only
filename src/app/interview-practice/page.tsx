import Link from "next/link";
import { InterviewCreditSummary } from "@/components/interview/interview-credit-summary";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { requireRole } from "@/lib/auth/guards";
import { getInterviewCreditBalance } from "@/lib/payments/interview-credits";

const modes = [
  {
    number: "1",
    title: "Practice by Competency",
    body: "Choose a practice area, filter the question bank, and deliberately improve how you communicate competency evidence.",
    href: "/interview-practice/sessions",
    action: "Choose a practice area",
    tone: "emerald",
  },
  {
    number: "2",
    title: "Mock Interview",
    body: "Complete an eight-question interview balanced across residency-relevant practice areas, without coaching hints during the session.",
    href: "/interview-practice/mock",
    action: "Start a mock interview",
    tone: "blue",
  },
] as const;

export default async function InterviewPracticePage() {
  const profile = await requireRole(["student"]);
  const balance = await getInterviewCreditBalance(profile.id);
  return (
    <AppShell title="Interview practice" name={profile.fullName}>
      <WorkspaceHero image="journey" className="mt-6">
        <p className="eyebrow">Competency-focused residency preparation</p>
        <h2 className="mt-3 text-4xl font-normal tracking-[0.02em] text-ink">
          Practice With Purpose
        </h2>
        <p className="mt-4 max-w-4xl leading-7 text-muted">
          Residency interviews are not simply about memorizing the right
          answers. They are opportunities to demonstrate how you communicate,
          reflect, work with others, respond to challenges, exercise
          professional judgment, and understand your future role as a physician.
          This tool helps you practice deliberately by improving how clearly and
          convincingly you communicate experiences, decisions, and behaviours
          that demonstrate residency-relevant competencies.
        </p>
        <p className="mt-3 max-w-4xl leading-7 text-muted">
          The framework is informed by principles from AAMC structured residency
          interview guidance, established graduate medical education competency
          frameworks, and broader residency recruitment practices. Repeated
          practice should help identify strengths, improve weaker areas,
          organize thoughts, and respond more effectively to unfamiliar
          questions. The goal is not memorization but clearer communication of
          who you are, how you think, and what your experiences demonstrate.
        </p>
      </WorkspaceHero>

      <InterviewCreditSummary balance={balance} />

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/interview-practice/results" className="button-primary">
          View Recent Results
        </Link>
        <Link href="/interview-practice/tips" className="button-secondary">
          Review interview guidance
        </Link>
      </div>

      <section
        className="mt-8 grid gap-6 md:grid-cols-2"
        aria-label="Practice modes"
      >
        {modes.map((mode) => (
          <Link
            key={mode.title}
            href={mode.href}
            className={`group rounded-2xl border bg-white p-7 hover:shadow-md ${
              mode.tone === "emerald"
                ? "border-slate-200 hover:border-emerald-400"
                : "border-slate-200 hover:border-blue-400"
            }`}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-black ${
                mode.tone === "emerald"
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-blue-100 text-blue-900"
              }`}
            >
              {mode.number}
            </span>
            <h3 className="mt-5 text-2xl font-bold">{mode.title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{mode.body}</p>
            <span className="mt-6 inline-block font-bold text-blue-800">
              {mode.action} →
            </span>
          </Link>
        ))}
      </section>

      <aside className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
        <strong>Educational practice only.</strong> Residency programs vary in
        interview formats, priorities, competencies, questions, and evaluation
        methods. This tool is not endorsed or approved by AAMC, ACGME, NRMP, or
        any residency program. Scores and feedback are practice assessments only
        and do not predict residency ranking, interview success, placement, or
        Match outcomes.
      </aside>
    </AppShell>
  );
}
