import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { YoutubeVideoCard } from "@/components/resources/youtube-video-card";
import { ResidencyDirectoryTable } from "@/components/resources/residency-directory-table";
import { ResidencyEventTable } from "@/components/resources/residency-event-table";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  RESIDENCY_DIRECTORY_COLUMNS,
  type ResidencyDirectoryRow,
} from "@/lib/residencies/directory";
import { getResourceCategory } from "@/lib/resources/videos";
import {
  RESIDENCY_EVENT_DIRECTORY_COLUMNS,
  type ResidencyEventDirectoryRow,
} from "@/lib/residencies/events";
import { createClient } from "@/lib/supabase/server";
import { getStageDefinition } from "@/lib/stages";
import { ResourceArticleCard } from "@/components/resources/resource-article-card";
import {
  getResourceSectionForStage,
  parseResourceSummary,
} from "@/lib/resources/articles";

export default async function ResourcesPage() {
  const profile = await requireOnboardedProfile();
  const stage = getStageDefinition(profile.studyStage);
  const category = getResourceCategory(stage.resourceSlug)!;
  const resourceSection = getResourceSectionForStage(profile.studyStage);
  const supabase = await createClient();
  const [
    { data: residencyRows },
    { data: eventRows },
    { data: resourceRows, error: resourceError },
  ] = await Promise.all([
    supabase
      .from("residencies")
      .select(RESIDENCY_DIRECTORY_COLUMNS)
      .order("source_order", { ascending: true })
      .order("id", { ascending: true })
      .range(0, 4),
    supabase
      .from("residency_event_directory")
      .select(RESIDENCY_EVENT_DIRECTORY_COLUMNS)
      .or(
        `event_date.gte.${new Date().toISOString().slice(0, 10)},event_date.is.null`,
      )
      .eq("status", "upcoming")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false })
      .range(0, 4),
    supabase
      .from("resources")
      .select(
        "id,slug,title,summary,summary_points,classification,resource_section,published_at",
      )
      .eq("classification", resourceSection.classification)
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(2),
  ]);
  if (resourceError) throw new Error("Unable to load resource articles.");
  const resourceArticles = (resourceRows ?? []).map(parseResourceSummary);
  const residencyTeaser = (residencyRows ??
    []) as unknown as ResidencyDirectoryRow[];
  const eventTeaser = (eventRows ??
    []) as unknown as ResidencyEventDirectoryRow[];
  return (
    <AppShell title="Resources" name={profile.fullName}>
      <WorkspaceHero image="guidelines" className="mt-6">
        <p className="eyebrow">Learning and application resources</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Practical tools for {stage.label}
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Your learning videos are focused on your current stage. Residency
          programs and applicant events remain available at every stage.
        </p>
      </WorkspaceHero>

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

      <section
        className="mt-10 border-b border-slate-200 pb-10"
        aria-labelledby="residency-opportunities-title"
      >
        <p className="eyebrow">Connect with programs</p>
        <h2
          id="residency-opportunities-title"
          className="mt-2 text-2xl font-black"
        >
          Open houses and networking opportunities
        </h2>
        <p className="mt-2 max-w-3xl leading-7 text-slate-600">
          Find researched applicant open houses, information sessions, resident
          Q&amp;As, and networking events. Compare dates and formats, then save
          the opportunities that matter to your application plan.
        </p>
        <div className="mt-5">
          {eventTeaser.length > 0 ? (
            <ResidencyEventTable rows={eventTeaser} compact />
          ) : (
            <p className="border border-slate-200 bg-white p-6 text-slate-600">
              New residency opportunities are being researched. Browse the
              directory for the latest verified events.
            </p>
          )}
        </div>
        <Link
          href="/resources/open-house-opportunities"
          className="button-primary mt-6"
        >
          Browse opportunities →
        </Link>
      </section>

      <section
        className="mt-10 border-b border-slate-200 pb-10"
        aria-labelledby="stage-resource-articles-title"
      >
        <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
          Your current stage
        </p>
        <h2
          id="stage-resource-articles-title"
          className="mt-2 border-b border-slate-300 pb-4 text-2xl font-black"
        >
          {resourceArticles[0]?.resource_section ?? resourceSection.title}
        </h2>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          {resourceSection.description}
        </p>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {resourceArticles.map((article) => (
            <ResourceArticleCard
              key={article.id}
              article={article}
              href={`/resources/library/${resourceSection.slug}/${article.slug}`}
            />
          ))}
        </div>
        <Link
          href={`/resources/library/${resourceSection.slug}`}
          className="button-primary mt-6"
        >
          View more resources from this section →
        </Link>
      </section>

      <section
        className="mt-10 border-b border-slate-200 pb-10 last:border-0"
        aria-labelledby={`${category.slug}-title`}
      >
        <p className="eyebrow">Stage {stage.rank} learning</p>
        <h2 id={`${category.slug}-title`} className="mt-2 text-2xl font-black">
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
    </AppShell>
  );
}
