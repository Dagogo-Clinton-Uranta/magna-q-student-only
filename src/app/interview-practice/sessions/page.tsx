import Link from "next/link";
import { InterviewCreditSummary } from "@/components/interview/interview-credit-summary";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { requireRole } from "@/lib/auth/guards";
import { getInterviewCreditBalance } from "@/lib/payments/interview-credits";
import {
  interviewPracticeAreas,
  interviewQuestions,
} from "@/lib/interview/questions";

export default async function PracticeSessionsPage() {
  const profile = await requireRole(["student"]);
  const balance = await getInterviewCreditBalance(profile.id);
  return (
    <AppShell title="Practice by competency" name={profile.fullName}>
      <WorkspaceHero image="guidelines" className="mt-5">
        <p className="eyebrow">
          10 practice areas · {interviewQuestions.length} questions
        </p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Choose the competency evidence you want to communicate more clearly
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          These are product practice areas, not official ACGME competency
          labels. Each question also carries question-type, difficulty, and
          specialty-relevance metadata.
        </p>
      </WorkspaceHero>
      <InterviewCreditSummary balance={balance} />
      <section
        className="mt-7 grid gap-4 md:grid-cols-2"
        aria-label="Interview practice areas"
      >
        {interviewPracticeAreas.map((area, index) => {
          const count = interviewQuestions.filter(
            (question) => question.practiceArea === area.id,
          ).length;
          return (
            <Link
              key={area.id}
              href={`/interview-practice/sessions/competency/${area.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-emerald-400 hover:shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Practice area {index + 1}
              </p>
              <h3 className="mt-2 text-xl font-bold group-hover:text-emerald-900">
                {area.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {area.description}
              </p>
              <p className="mt-4 font-bold text-blue-800">
                {count} questions →
              </p>
            </Link>
          );
        })}
      </section>
    </AppShell>
  );
}
