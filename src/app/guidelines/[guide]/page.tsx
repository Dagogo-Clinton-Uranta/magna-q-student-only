import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ChronologicalTimeline } from "@/components/guidelines/chronological-timeline";
import { requireRole } from "@/lib/auth/guards";
import { getGuide, guides } from "@/lib/guidelines/guides";
import { StepOneApplicationGuide } from "@/components/guidelines/step-one-application-guide";
import { ResidencyMatchPlanner } from "@/components/guidelines/residency-match-planner";
import {
  getGuidelineCardPlacement,
  guidelineCardClassName,
  guidelineCardGridClassName,
  parseGuidelineSummary,
} from "@/lib/guidelines/articles";
import { createClient } from "@/lib/supabase/server";

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
  const guidelineArticles = await getGuidelineArticles(guide.slug);
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
      <section className={guidelineCardGridClassName}>
        <div
          className={`${guidelineCardClassName} border border-slate-200 bg-white`}
        >
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
        <div
          className={`${guidelineCardClassName} border border-blue-200 bg-blue-50`}
        >
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
        {guidelineArticles.map((article) => (
          <Link
            key={article.id}
            href={`/guidelines/residency-match/${article.slug}`}
            className={`group ${guidelineCardClassName} border border-brand-300 bg-soft transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-lg ${getGuidelineCardPlacement(article.slug)}`}
          >
            <p className="eyebrow">Guideline article</p>
            <h2 className="mt-2 text-xl font-bold text-ink">{article.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {article.summary}
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-body">
              {article.summary_points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span aria-hidden="true" className="text-brand-700">
                    •
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <span className="mt-auto inline-flex pt-5 font-bold text-brand-800 group-hover:underline">
              Read the full guide →
            </span>
          </Link>
        ))}
      </section>
      {guide.slug === "step-1" && <StepOneApplicationGuide />}
    </AppShell>
  );
}

async function getGuidelineArticles(guideSlug: string) {
  if (guideSlug !== "residency-match") return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guidelines")
    .select("id,slug,title,summary,summary_points,classification,published_at")
    .eq("classification", "residency-and-matching")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) throw new Error("Unable to load residency guideline articles.");
  return (data ?? []).map(parseGuidelineSummary);
}
