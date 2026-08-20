import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { YoutubeVideoCard } from "@/components/resources/youtube-video-card";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import { RESOURCE_CATEGORIES } from "@/lib/resources/videos";

export default async function ResourcesPage() {
  const profile = await requireOnboardedProfile();
  return (
    <AppShell title="Resources" name={profile.fullName}>
      <section className="mt-6 border border-brand-200 bg-soft p-6 sm:p-8">
        <p className="eyebrow">Video library</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Guided learning for every stage of your USMLE journey
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Explore selected YouTube lessons for exam preparation and residency
          interviews without leaving Magna-Q.
        </p>
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
