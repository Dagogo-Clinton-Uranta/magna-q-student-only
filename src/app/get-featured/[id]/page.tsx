import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeatureEngagement } from "@/components/features/feature-engagement";
import { AppShell } from "@/components/layout/app-shell";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  countValue,
  featurePortraitPosition,
  type CommunityFeature,
  type FeatureComment,
} from "@/lib/features/types";
import { featureIdSchema } from "@/lib/features/validation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Community Feature | Magna-Q",
};

export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { id: rawId } = await params;
  const id = featureIdSchema.safeParse(rawId);
  if (!id.success) notFound();

  const supabase = await createClient();
  const [{ data: rawFeature }, { data: rawComments }, { data: ownPulse }] =
    await Promise.all([
      supabase
        .from("community_features")
        .select("*")
        .eq("id", id.data)
        .maybeSingle(),
      supabase
        .from("feature_comments")
        .select(
          "id,feature_id,user_id,username,user_name,content,mentioned_usernames,created_at",
        )
        .eq("feature_id", id.data)
        .eq("moderation_status", "accepted")
        .order("created_at", { ascending: true }),
      supabase
        .from("feature_pulses")
        .select("feature_id")
        .eq("feature_id", id.data)
        .eq("user_id", profile.id)
        .maybeSingle(),
    ]);
  if (!rawFeature) notFound();
  const feature = rawFeature as CommunityFeature;
  const comments = (rawComments ?? []) as FeatureComment[];
  const featuredDate = feature.featured_at ?? feature.created_at;

  return (
    <AppShell title="Community feature" name={profile.fullName}>
      <article className="mx-auto mt-6 max-w-5xl border border-line bg-field shadow-card">
        <div className="max-h-[34rem] overflow-hidden bg-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={feature.image_url}
            alt={feature.image_alt_text}
            className={`h-full max-h-[34rem] w-full object-cover ${featurePortraitPosition(feature.id)}`}
          />
        </div>
        <div className="p-6 sm:p-10">
          <p className="eyebrow">Featured community project</p>
          <h1 className="mt-4 max-w-4xl text-3xl font-normal leading-tight tracking-[0.02em] text-ink sm:text-5xl">
            {feature.title}
          </h1>
          <blockquote className="mt-7 border-l-4 border-brand-500 bg-soft px-6 py-5 text-xl italic leading-8 text-brand-900">
            “{feature.representative_quote}”
          </blockquote>
          <div className="mt-8 whitespace-pre-wrap text-lg leading-9 text-body">
            {feature.summary}
          </div>
          <footer className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted">
                Connect in Magna-Q
              </p>
              <p className="mt-1 text-lg font-semibold text-brand-800">
                @{feature.username}
              </p>
            </div>
            <p className="text-sm text-muted">
              Featured{" "}
              {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
                new Date(featuredDate),
              )}
            </p>
          </footer>
          {feature.image_credit_text && feature.image_credit_url && (
            <p className="mt-4 text-xs text-muted">
              <a
                href={feature.image_credit_url}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {feature.image_credit_text}
              </a>
            </p>
          )}
          <FeatureEngagement
            featureId={feature.id}
            featuredUsername={feature.username}
            initialPulseCount={countValue(feature.pulse_count)}
            initiallyPulsed={Boolean(ownPulse)}
            comments={comments}
          />
        </div>
      </article>
    </AppShell>
  );
}
