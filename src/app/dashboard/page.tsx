import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { ResumeBlockButton } from "@/components/study/resume-block-button";
import { BlogCard, type BlogSummary } from "@/components/blog/blog-card";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getStageDefinition } from "@/lib/stages";

type PerformanceRow = { name: string; attempts: number; correct: number };
export default async function DashboardPage() {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();
  const stage = getStageDefinition(profile.studyStage);
  const [{ data: currentExam }, { data: blogPosts }] = await Promise.all([
    stage.examCode
      ? supabase
          .from("exams")
          .select("id")
          .eq("code", stage.examCode)
          .eq("active", true)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("blog_posts")
      .select(
        "id,title,paragraph_1,category,author_name,published_at,image_urls,image_alt_texts",
      )
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(2),
  ]);
  const [{ data: blocks }, { data: analytics }] = currentExam
    ? await Promise.all([
        supabase
          .from("test_blocks")
          .select(
            "id,mode,status,actual_question_count,current_position,created_at",
          )
          .eq("exam_id", currentExam.id)
          .in("status", ["created", "in_progress", "suspended"])
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.rpc("student_dashboard_summary_for_exam", {
          selected_exam_id: currentExam.id,
        }),
      ])
    : [{ data: [] }, { data: {} }];
  const summary = (analytics ?? {}) as {
    totalAnswered?: number;
    overallPctCorrect?: number | null;
    markedCount?: number;
    recentBlocks?: Array<{
      id: string;
      mode: string;
      status: string;
      actual_question_count: number;
    }>;
    subjects?: PerformanceRow[];
    categories?: PerformanceRow[];
  };
  return (
    <AppShell title="Student dashboard" name={profile.fullName}>
      <WorkspaceHero image="journey" className="mt-8">
        <p className="eyebrow">Your next step</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Your {stage.shortLabel} workspace
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          {stage.description}. Change your current stage from your profile
          whenever your focus changes.
        </p>
        <Link
          href={stage.examCode ? "/create-test" : "/interview-practice"}
          className="button-primary mt-6"
        >
          {stage.examCode
            ? "Create a practice test"
            : "Practice for interviews"}{" "}
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </Link>
      </WorkspaceHero>
      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Choose your path</p>
            <h2 className="mt-2 text-2xl font-normal tracking-[0.02em] text-ink">
              Content for {stage.label}
            </h2>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {stage.examCode ? (
            <>
              <StudyPath
                title={stage.label}
                description={stage.description}
                href="/create-test"
                index={`0${stage.rank}`}
              />
              <StudyPath
                title="Interview practice"
                description="Interview tips and guided video sessions"
                href="/interview-practice"
                index="04"
              />
            </>
          ) : (
            <>
              <StudyPath
                title="Interview practice"
                description="Residency tips and guided sessions"
                href="/interview-practice"
                index="04"
              />
              <StudyPath
                title="Residency & Match"
                description="Applications, ranking, and Match milestones"
                href="/guidelines"
                index="04"
              />
            </>
          )}
        </div>
      </section>
      {stage.examCode && (
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric
            label="Questions answered"
            value={String(summary.totalAnswered ?? 0)}
          />
          <Metric
            label="Overall correct"
            value={
              summary.overallPctCorrect == null
                ? "—"
                : `${summary.overallPctCorrect}%`
            }
          />
          <Metric
            label="Marked questions"
            value={String(summary.markedCount ?? 0)}
          />
        </section>
      )}
      {blocks && blocks.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-normal tracking-[0.02em]">
            Active blocks
          </h2>
          <div className="mt-3 space-y-3">
            {blocks.map((block) => (
              <article
                key={block.id}
                className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold capitalize">
                    {block.mode} block · {block.actual_question_count} questions
                  </p>
                  <p className="text-sm capitalize text-muted">
                    {block.status.replaceAll("_", " ")} · question{" "}
                    {block.current_position}
                  </p>
                </div>
                {block.status === "suspended" ? (
                  <ResumeBlockButton blockId={block.id} />
                ) : (
                  <Link
                    href={`/study/block/${block.id}`}
                    className="button-primary"
                  >
                    Continue block
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
      {stage.examCode && (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Performance
            title="Subject performance"
            rows={summary.subjects ?? []}
          />
          <Performance
            title="Category performance"
            rows={summary.categories ?? []}
          />
        </div>
      )}
      {stage.examCode && (
        <section className="card mt-6 p-5">
          <h2 className="text-xl font-normal tracking-[0.02em]">
            Previous blocks
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {(summary.recentBlocks ?? []).map((block) => (
              <li
                key={block.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-semibold capitalize">
                    {block.mode} · {block.actual_question_count} questions
                  </p>
                  <p className="text-sm capitalize text-muted">
                    {block.status.replaceAll("_", " ")}
                  </p>
                </div>
                {block.status === "completed" && (
                  <Link
                    href={`/study/block/${block.id}/results`}
                    className="font-semibold text-brand-700"
                  >
                    Results
                  </Link>
                )}
              </li>
            ))}
            {(summary.recentBlocks ?? []).length === 0 && (
              <li className="py-4 text-muted">No previous blocks yet.</li>
            )}
          </ul>
        </section>
      )}
      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">From the community</p>
            <h2 className="mt-2 text-2xl font-normal tracking-[0.02em]">
              Latest blogs
            </h2>
          </div>
          <Link
            href="/blogs"
            className="font-bold text-brand-700 hover:text-brand-800"
          >
            View all →
          </Link>
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {(blogPosts as BlogSummary[] | null)?.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
function StudyPath({
  title,
  description,
  href,
  index,
}: {
  title: string;
  description: string;
  href: string;
  index: string;
}) {
  return (
    <Link
      href={href}
      className="group border border-line bg-white p-5 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-card"
    >
      <span className="text-xs tracking-[0.16em] text-brand-600">{index}</span>
      <p className="mt-3 text-lg font-normal tracking-[0.02em] text-ink">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-brand-700 group-hover:underline">
        Open →
      </span>
    </Link>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-normal tracking-[0.02em] text-ink">
        {value}
      </p>
    </div>
  );
}
function Performance({
  title,
  rows,
}: {
  title: string;
  rows: PerformanceRow[];
}) {
  return (
    <section className="card p-5">
      <h2 className="text-lg font-normal tracking-[0.02em]">{title}</h2>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.name} className="flex justify-between gap-3 text-sm">
            <span>{row.name}</span>
            <strong>
              {row.attempts
                ? Math.round((row.correct * 1000) / row.attempts) / 10
                : 0}
              %
            </strong>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="text-sm text-muted">
            Complete questions to see performance.
          </li>
        )}
      </ul>
    </section>
  );
}
