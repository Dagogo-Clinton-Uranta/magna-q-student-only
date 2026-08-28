import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { requirePaidStudent } from "@/lib/auth/guards";
import { interviewCategories } from "@/lib/interview/questions";

export default async function PracticeSessionsPage() {
  const { profile } = await requirePaidStudent("/interview-practice/sessions");
  return (
    <AppShell title="Residency interview practice" name={profile.fullName}>
      <WorkspaceHero image="guidelines" className="mt-5">
        <p className="eyebrow">162 guided prompts</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Choose the kind of question you want to practice
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Record a private two-minute response in 360p, review it before upload,
          and receive structured feedback. Camera and microphone access begins
          only after you choose a question.
        </p>
      </WorkspaceHero>
      <section
        className="mt-7 grid gap-4 lg:grid-cols-2"
        aria-label="Interview question categories"
      >
        {interviewCategories.map((category, categoryIndex) => (
          <details
            key={category.slug}
            className="group rounded-xl border border-slate-200 bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <span>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Category {String(categoryIndex + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 block text-lg font-bold">
                  {category.title}
                </span>
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
                {category.questions.length} questions{" "}
                <span className="ml-2 inline-block group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <ol className="border-t border-slate-100 p-3">
              {category.questions.map((question, questionIndex) => (
                <li key={question}>
                  <Link
                    href={`/interview-practice/sessions/${category.slug}/${questionIndex}`}
                    className="flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-900">
                      {questionIndex + 1}
                    </span>
                    {question}
                  </Link>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </section>
    </AppShell>
  );
}
