import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { ResourceArticleCard } from "@/components/resources/resource-article-card";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  getResourceSection,
  parseResourceSummary,
} from "@/lib/resources/articles";
import { createClient } from "@/lib/supabase/server";

export default async function ResourceLibraryPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const section = getResourceSection((await params).section);
  if (!section) notFound();
  if (section.stage !== profile.studyStage) redirect("/resources");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select(
      "id,slug,title,summary,summary_points,classification,resource_section,published_at",
    )
    .eq("classification", section.classification)
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) throw new Error("Unable to load resource articles.");
  const articles = (data ?? []).map(parseResourceSummary);
  const articleGroups = articles.reduce(
    (groups, article) => {
      (groups[article.resource_section] ??= []).push(article);
      return groups;
    },
    {} as Record<string, typeof articles>,
  );

  return (
    <AppShell title="Resource library" name={profile.fullName}>
      <Link
        href="/resources"
        className="mt-5 inline-block text-sm font-bold text-blue-800"
      >
        ← All resources
      </Link>
      <WorkspaceHero image="journey" className="mt-4 sm:p-9">
        <p className="eyebrow">Your current stage</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-normal tracking-[0.02em] text-ink">
          {section.title}
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          {section.description}
        </p>
      </WorkspaceHero>
      {Object.entries(articleGroups).map(([resourceSection, resources]) => (
        <section
          key={resourceSection}
          className="mt-10"
          aria-labelledby={`resource-section-${resourceSection.replaceAll(" ", "-").toLowerCase()}`}
        >
          <h2
            id={`resource-section-${resourceSection.replaceAll(" ", "-").toLowerCase()}`}
            className="border-b border-slate-300 pb-4 text-sm font-bold uppercase tracking-widest text-blue-700"
          >
            {resourceSection}
          </h2>
          <div className="mt-5 grid auto-rows-fr gap-5 lg:grid-cols-2">
            {resources.map((article) => (
              <ResourceArticleCard
                key={article.id}
                article={article}
                href={`/resources/library/${section.slug}/${article.slug}`}
                expanded
              />
            ))}
          </div>
        </section>
      ))}
    </AppShell>
  );
}
