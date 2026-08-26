import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { GuidelineArticle } from "@/components/guidelines/guideline-article";
import { requireRole } from "@/lib/auth/guards";
import {
  type GuidelineClassification,
  parseGuidelineArticle,
} from "@/lib/guidelines/articles";
import { getGuide } from "@/lib/guidelines/guides";
import { createClient } from "@/lib/supabase/server";
import { getStageDefinition } from "@/lib/stages";

const classificationByGuide: Record<string, GuidelineClassification> = {
  "step-1": "usmle-step-1",
  "step-2-ck": "usmle-step-2-ck",
  "step-3": "usmle-step-3",
  "residency-match": "residency-and-matching",
};

export default async function GuidelineArticlePage({
  params,
}: {
  params: Promise<{ guide: string; article: string }>;
}) {
  const profile = await requireRole(["student"]);
  const { guide: guideSlug, article: articleSlug } = await params;
  const guide = getGuide(guideSlug);
  if (!guide) notFound();
  if (guide.slug !== getStageDefinition(profile.studyStage).guideSlug) {
    redirect("/guidelines");
  }

  const classification = classificationByGuide[guide.slug];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guidelines")
    .select("*")
    .eq("slug", articleSlug)
    .eq("classification", classification)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error("Unable to load this guideline article.");
  if (!data) notFound();

  return (
    <AppShell title={`${guide.title} article`} name={profile.fullName}>
      <GuidelineArticle
        article={parseGuidelineArticle(data)}
        backHref={`/guidelines/${guide.slug}`}
      />
    </AppShell>
  );
}
