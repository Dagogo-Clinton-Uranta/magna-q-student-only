import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { BlockBuilder } from "@/components/study/block-builder";
import { requirePaidStudent } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getStageDefinition } from "@/lib/stages";

type CountMap = Record<string, number>;

export default async function CreateTestPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>;
}) {
  const requested = (await searchParams).exam;
  const returnTo = requested
    ? `/create-test?exam=${encodeURIComponent(requested)}`
    : "/create-test";
  const { profile } = await requirePaidStudent(returnTo);
  const stage = getStageDefinition(profile.studyStage);
  if (!stage.examCode) redirect("/interview-practice");
  const examCode = stage.examCode;
  if (requested && requested !== examCode) {
    redirect(`/create-test?exam=${examCode}`);
  }
  const supabase = await createClient();
  const { data: exam } = await supabase
    .from("exams")
    .select("id,name")
    .eq("code", examCode)
    .eq("active", true)
    .single();

  if (!exam) {
    return (
      <AppShell title="Create a new test" name={profile.fullName}>
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          Your target examination is not available. Update your profile or
          contact an administrator.
        </p>
      </AppShell>
    );
  }

  const [
    { data: subjects },
    { data: categories },
    { data: mappings },
    { data: taxonomyCounts },
  ] = await Promise.all([
    supabase
      .from("subjects")
      .select("id,exam_id,name")
      .eq("exam_id", exam.id)
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("categories")
      .select("id,exam_id,name")
      .eq("exam_id", exam.id)
      .eq("active", true)
      .order("sort_order"),
    supabase.from("subject_categories").select("subject_id,category_id"),
    supabase.rpc("student_test_builder_taxonomy_counts", {
      selected_exam_id: exam.id,
    }),
  ]);

  const counts = (taxonomyCounts ?? {}) as {
    subjects?: CountMap;
    systems?: CountMap;
  };

  return (
    <AppShell title="Create a new test" name={profile.fullName}>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-3xl text-slate-700">
          Build a practice test for {exam.name}. Choose the question history,
          subjects, and systems you want to focus on.
        </p>
        <Link href="/dashboard" className="font-semibold text-blue-800">
          Back to dashboard
        </Link>
      </div>
      <BlockBuilder
        exam={exam}
        subjects={subjects ?? []}
        categories={categories ?? []}
        mappings={mappings ?? []}
        subjectCounts={counts.subjects ?? {}}
        systemCounts={counts.systems ?? {}}
      />
    </AppShell>
  );
}
