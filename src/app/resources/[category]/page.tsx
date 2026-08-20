import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { YoutubeVideoCard } from "@/components/resources/youtube-video-card";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import { getResourceCategory } from "@/lib/resources/videos";

const VIDEOS_PER_PAGE = 10;

export default async function ResourceCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { category: categorySlug } = await params;
  const category = getResourceCategory(categorySlug);
  if (!category) notFound();

  const requestedPage = Number((await searchParams).page ?? "1");
  const totalPages = Math.max(
    1,
    Math.ceil(category.videos.length / VIDEOS_PER_PAGE),
  );
  if (
    !Number.isInteger(requestedPage) ||
    requestedPage < 1 ||
    requestedPage > totalPages
  )
    redirect(`/resources/${category.slug}?page=1`);

  const start = (requestedPage - 1) * VIDEOS_PER_PAGE;
  const videos = category.videos.slice(start, start + VIDEOS_PER_PAGE);

  return (
    <AppShell title={category.title} name={profile.fullName}>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="max-w-3xl leading-7 text-slate-600">
            {category.description}
          </p>
          <p className="mt-2 text-sm font-bold text-blue-800">
            Page {requestedPage} of {totalPages} · {category.videos.length}{" "}
            videos
          </p>
        </div>
        <Link href="/resources" className="font-bold text-blue-800">
          ← All resources
        </Link>
      </div>

      <section
        className="mt-7 grid gap-6 md:grid-cols-2"
        aria-label={`${category.title} videos`}
      >
        {videos.map((video) => (
          <YoutubeVideoCard key={video.id} video={video} />
        ))}
      </section>

      {totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-3"
          aria-label="Video pages"
        >
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <Link
                key={page}
                href={`/resources/${category.slug}?page=${page}`}
                aria-current={page === requestedPage ? "page" : undefined}
                className={`flex h-11 min-w-11 items-center justify-center border px-3 font-normal ${page === requestedPage ? "border-black bg-black text-white" : "border-line bg-white text-body"}`}
              >
                {page}
              </Link>
            ),
          )}
        </nav>
      )}
    </AppShell>
  );
}
