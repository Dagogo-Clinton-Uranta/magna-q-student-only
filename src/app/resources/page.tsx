import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { YoutubeVideoCard } from "@/components/resources/youtube-video-card";
import { ResidencyDirectoryTable } from "@/components/resources/residency-directory-table";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  RESIDENCY_DIRECTORY_COLUMNS,
  type ResidencyDirectoryRow,
} from "@/lib/residencies/directory";
import { RESOURCE_CATEGORIES } from "@/lib/resources/videos";
import { createClient } from "@/lib/supabase/server";

export default async function ResourcesPage() {
  const profile = await requireOnboardedProfile();
  const supabase = await createClient();
  const { data: residencyRows } = await supabase
    .from("residencies")
    .select(RESIDENCY_DIRECTORY_COLUMNS)
    .order("source_order", { ascending: true })
    .order("id", { ascending: true })
    .range(0, 4);
  const residencyTeaser = (residencyRows ??
    []) as unknown as ResidencyDirectoryRow[];
  return (
    <AppShell title="Resources" name={profile.fullName}>
      <section className="mt-6 border border-brand-200 bg-soft p-6 sm:p-8">
        <p className="eyebrow">Learning and application resources</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Practical tools for your USMLE and residency journey
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Explore residency-program information and selected video lessons for
          exam preparation and interviews without leaving Magna-Q.
        </p>
      </section>

      <section
        className="mt-10 border-b border-slate-200 pb-10"
        aria-labelledby="residency-directory-title"
      >
        <p className="eyebrow">Program discovery</p>
        <h2 id="residency-directory-title" className="mt-2 text-2xl font-black">
          Residency directory
        </h2>
        <p className="mt-2 max-w-3xl leading-7 text-slate-600">
          Browse our growing directory of U.S. residency programs to compare
          specialties, locations, training details, and currently listed visa
          routes. Build a more informed application strategy and uncover
          programs that may not yet be on your radar.
        </p>
        <div className="mt-5">
          {residencyTeaser.length > 0 ? (
            <ResidencyDirectoryTable rows={residencyTeaser} compact />
          ) : (
            <p className="border border-slate-200 bg-white p-6 text-slate-600">
              Residency records are being prepared. Open the directory shortly
              for the latest entries.
            </p>
          )}
        </div>
        <Link
          href="/resources/residency-directory"
          className="button-primary mt-6"
        >
          Browse full directory →
        </Link>
      </section>

      {RESOURCE_CATEGORIES.map((category) => (
        <section
          key={category.slug}
          className="mt-10 border-b border-slate-200 pb-10 last:border-0"
          aria-labelledby={`${category.slug}-title`}
        >
          <h2 id={`${category.slug}-title`} className="text-2xl font-black">
            {category.title}
          </h2>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            {category.description}
          </p>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {category.videos.slice(0, 2).map((video) => (
              <YoutubeVideoCard key={video.id} video={video} />
            ))}
          </div>
          <Link
            href={`/resources/${category.slug}`}
            className="button-primary mt-6"
          >
            View more {category.title} videos →
          </Link>
        </section>
      ))}
    </AppShell>
  );
}
