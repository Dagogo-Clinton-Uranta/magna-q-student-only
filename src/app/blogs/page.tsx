import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { BlogCard, type BlogSummary } from "@/components/blog/blog-card";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

const POSTS_PER_PAGE = 6;

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { page } = await searchParams;
  const parsedPage = Number.parseInt(page ?? "1", 10);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const supabase = await createClient();
  const { data: posts, count } = await supabase
    .from("blog_posts")
    .select(
      "id,title,paragraph_1,category,author_name,published_at,image_urls,image_alt_texts",
      { count: "exact" },
    )
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range(
      (currentPage - 1) * POSTS_PER_PAGE,
      currentPage * POSTS_PER_PAGE - 1,
    );
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / POSTS_PER_PAGE));
  return (
    <AppShell title="Community blogs" name={profile.fullName}>
      <WorkspaceHero image="guidelines" className="mt-6">
        <p className="eyebrow">Learn together</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          U.S. medical policy, research and training-system updates
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Plain-language, source-linked briefings on the issues shaping American
          medicine—and how to discuss them thoughtfully in exams and residency
          interviews.
        </p>
      </WorkspaceHero>
      <section
        className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        aria-label="Blog articles"
      >
        {(posts as BlogSummary[] | null)?.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </section>
      {!posts?.length && (
        <p className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No articles have been published yet.
        </p>
      )}
      {totalPages > 1 && (
        <nav
          aria-label="Blog pages"
          className="mt-8 flex items-center justify-center gap-4"
        >
          {currentPage > 1 ? (
            <Link
              href={`/blogs?page=${currentPage - 1}`}
              className="button-secondary"
            >
              ← Newer posts
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm font-semibold text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={`/blogs?page=${currentPage + 1}`}
              className="button-secondary"
            >
              Older posts →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </AppShell>
  );
}
