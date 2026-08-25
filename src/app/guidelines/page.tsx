import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/guards";
import { guides } from "@/lib/guidelines/guides";
import { getStageDefinition } from "@/lib/stages";

export default async function GuidelinesPage() {
  const profile = await requireRole(["student"]);
  const stage = getStageDefinition(profile.studyStage);
  const visibleGuides = guides.filter(
    (guide) => guide.slug === stage.guideSlug,
  );
  return (
    <AppShell title="Timelines and Guidelines" name={profile.fullName}>
      <section className="relative mt-6 overflow-hidden border border-brand-200 bg-soft p-6 sm:p-9">
        <Image
          src="/images/usmle-guidelines-hero.png"
          alt="Medical student planning a study and residency journey"
          fill
          priority
          className="object-cover object-right opacity-10"
        />
        <div className="relative max-w-2xl">
          <p className="eyebrow">Start here</p>
          <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
            A clear map from medical school to residency.
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-muted">
            Your workspace currently focuses on {stage.label}. This planning
            guide changes automatically when you update your current stage in
            your profile.
          </p>
        </div>
      </section>
      <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-bold text-amber-950">Before you choose a date</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-amber-900">
          Rules, fees, eligibility and test formats can change. Check the
          official source linked on every page, your medical school’s policies,
          and—if you are an IMG—your ECFMG/Intealth status before paying or
          booking.
        </p>
      </section>
      <section className="mt-10">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
          Your current stage
        </p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {visibleGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guidelines/${guide.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-black text-blue-800">
                  {stage.rank}
                </span>
                <span className="text-sm font-bold text-blue-800 group-hover:underline">
                  Open guide →
                </span>
              </div>
              <p className="mt-5 text-sm font-bold uppercase tracking-widest text-slate-500">
                {guide.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-black">{guide.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{guide.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
