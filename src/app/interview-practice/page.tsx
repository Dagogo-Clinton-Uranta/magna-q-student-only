import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requireResidencyStageStudent } from "@/lib/auth/guards";

export default async function InterviewPracticePage() {
  const { profile } = await requireResidencyStageStudent("/interview-practice");
  return (
    <AppShell title="Interview practice" name={profile.fullName}>
      <section className="mt-6 border border-brand-200 bg-soft p-6 sm:p-8">
        <p className="eyebrow">Residency preparation</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Prepare your thinking, then practice your delivery
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Build answers that are authentic, memorable and focused on what
          residency programs need from the doctors they train.
        </p>
      </section>
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <Link
          href="/interview-practice/tips"
          className="group rounded-2xl border border-slate-200 bg-white p-7 hover:border-blue-400 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl font-black text-blue-900">
            01
          </span>
          <h2 className="mt-5 text-2xl font-bold group-hover:text-blue-800">
            Interview tips
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Walk through common questions, program expectations, storytelling,
            red flags and follow-up strategy.
          </p>
          <span className="mt-6 inline-block font-bold text-blue-800">
            Explore interview tips →
          </span>
        </Link>
        <Link
          href="/interview-practice/sessions"
          className="group rounded-2xl border border-slate-200 bg-white p-7 hover:border-emerald-400 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-xl font-black text-emerald-900">
            02
          </span>
          <h2 className="mt-5 text-2xl font-bold group-hover:text-emerald-800">
            Practice sessions
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Rehearse adaptable answers aloud using realistic residency interview
            prompts and reflection cues.
          </p>
          <span className="mt-6 inline-block font-bold text-emerald-800">
            Start a practice session →
          </span>
        </Link>
      </section>
    </AppShell>
  );
}
