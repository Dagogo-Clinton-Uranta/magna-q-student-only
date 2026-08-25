import Link from "next/link";
import { PulseIcon } from "@/components/features/pulse-icon";
import { countValue, type CommunityFeature } from "@/lib/features/types";

export function FeatureCard({ feature }: { feature: CommunityFeature }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-field shadow-card">
      <div className="h-52 overflow-hidden bg-soft">
        {/* Uploaded and admin-selected feature images are stored as public URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={feature.image_url}
          alt={feature.image_alt_text}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">
            Community spotlight
          </p>
          {feature.is_sample && (
            <span className="rounded-full bg-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Sample
            </span>
          )}
        </div>
        <h3 className="mt-2 text-xl font-bold leading-snug text-ink">
          {feature.title}
        </h3>
        <p className="mt-3 line-clamp-4 leading-7 text-muted">
          {feature.summary}
        </p>
        <p className="mt-4 text-sm font-semibold text-brand-800">
          @{feature.username}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
          <span className="flex items-center gap-3 text-muted">
            <span className="inline-flex items-center gap-1">
              <PulseIcon className="h-4 w-4" />
              {countValue(feature.pulse_count)}
            </span>
            <span>{countValue(feature.comment_count)} comments</span>
          </span>
          <Link
            href={`/get-featured/${feature.id}`}
            className="font-bold text-brand-800 hover:underline"
          >
            See more →
          </Link>
        </div>
      </div>
    </article>
  );
}
