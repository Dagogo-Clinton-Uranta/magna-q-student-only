import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { GuidelineArticle } from "@/components/guidelines/guideline-article";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  getResourceSection,
  parseResourceArticle,
} from "@/lib/resources/articles";
import { createClient } from "@/lib/supabase/server";

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ section: string; article: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { section: sectionSlug, article: articleSlug } = await params;
  const section = getResourceSection(sectionSlug);
  if (!section) notFound();
  if (section.stage !== profile.studyStage) redirect("/resources");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("slug", articleSlug)
    .eq("classification", section.classification)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error("Unable to load this resource article.");
  if (!data) notFound();
  const article = parseResourceArticle(data);

  return (
    <AppShell title={`${section.title} article`} name={profile.fullName}>
      <GuidelineArticle
        article={article}
        backHref={`/resources/library/${section.slug}`}
        backLabel="Back to resources"
        documentUrl={article.document_s3_url}
        documentFileName={data.source_document_name}
      />
    </AppShell>
  );
}
