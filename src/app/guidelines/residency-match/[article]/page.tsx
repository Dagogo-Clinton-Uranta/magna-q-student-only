import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { GuidelineArticle } from "@/components/guidelines/guideline-article";
import { requireRole } from "@/lib/auth/guards";
import { parseGuidelineArticle } from "@/lib/guidelines/articles";
import { createClient } from "@/lib/supabase/server";

export default async function ResidencyGuidelineArticlePage({
  params,
}: {
  params: Promise<{ article: string }>;
}) {
  const profile = await requireRole(["student"]);
  const { article: slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guidelines")
    .select("*")
    .eq("slug", slug)
    .eq("classification", "residency-and-matching")
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error("Unable to load this guideline article.");
  if (!data) notFound();

  return (
    <AppShell title="Residency guideline article" name={profile.fullName}>
      <GuidelineArticle article={parseGuidelineArticle(data)} />
    </AppShell>
  );
}
