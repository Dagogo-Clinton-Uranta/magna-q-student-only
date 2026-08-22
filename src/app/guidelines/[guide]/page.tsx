import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ChronologicalTimeline } from "@/components/guidelines/chronological-timeline";
import { requireRole } from "@/lib/auth/guards";
import { getGuide, guides } from "@/lib/guidelines/guides";
import { StepOneApplicationGuide } from "@/components/guidelines/step-one-application-guide";
import { ResidencyMatchPlanner } from "@/components/guidelines/residency-match-planner";

export function generateStaticParams() {
  return guides.map((guide) => ({ guide: guide.slug }));
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ guide: string }>;
}) {
  const profile = await requireRole(["student"]);
  const guide = getGuide((await params).guide);
  if (!guide) notFound();
  return (
    <AppShell title="Timelines and Guidelines" name={profile.fullName}>
      <Link
        href="/guidelines"
        className="mt-5 inline-block text-sm font-bold text-blue-800"
      >
        ← All guidelines
      </Link>
      <section className="mt-4 border border-brand-200 bg-soft p-6 sm:p-9">
        <p className="eyebrow">{guide.eyebrow}</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-normal tracking-[0.02em] text-ink">
          {guide.title}
        </h2>
        <p className="mt-4 max-w-3xl leading-7 text-muted">{guide.summary}</p>
      </section>
      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {guide.examAtAGlance.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>
      <div
        className={
          guide.residencyTimeline
            ? "mt-10 space-y-7"
            : "mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]"
        }
      >
        <section>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
            Chronological planner
          </p>
          <h2 className="mt-2 text-2xl font-black">What to do, in order</h2>
          {guide.residencyTimeline ? (
            <ResidencyMatchPlanner
              items={guide.residencyTimeline}
              today={new Date().toISOString().slice(0, 10)}
            />
          ) : (
            <ChronologicalTimeline items={guide.timeline ?? []} />
          )}
        </section>
        <aside className="h-fit rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-bold text-red-950">Common gotchas</h2>
          <ul
            className={`mt-3 text-sm leading-6 text-red-900 ${
              guide.residencyTimeline
                ? "grid gap-3 md:grid-cols-2 xl:grid-cols-4"
                : "space-y-3"
            }`}
          >
            {guide.gotchas.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden>!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">What to expect</h2>
          <ul className="mt-4 space-y-3 leading-7 text-slate-700">
            {guide.whatToExpect.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="font-bold text-blue-700">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-xl font-bold text-blue-950">Official sources</h2>
          <p className="mt-2 text-sm leading-6 text-blue-900">
            Reviewed August 2026. Open the source before acting—this guide
            summarizes, but the official policy controls.
          </p>
          <ul className="mt-4 space-y-3">
            {guide.sources.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-800 underline underline-offset-2"
                >
                  {source.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      {guide.slug === "step-1" && <StepOneApplicationGuide />}
    </AppShell>
  );
}
