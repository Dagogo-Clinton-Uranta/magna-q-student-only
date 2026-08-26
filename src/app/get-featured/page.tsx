import type { Metadata } from "next";
import { FeatureCard } from "@/components/features/feature-card";
import { FeatureSubmissionForm } from "@/components/features/feature-submission-form";
import { AppShell } from "@/components/layout/app-shell";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import type { CommunityFeature } from "@/lib/features/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Get Featured | Magna-Q",
  description:
    "Share the work you are building and bring it in front of the Magna-Q medical community.",
};

export default async function GetFeaturedPage() {
  const profile = await requireOnboardedProfile();
  const supabase = await createClient();
  const { data: features } = await supabase
    .from("community_features")
    .select("*")
    .eq("in_app_feature", true)
    .order("featured_at", { ascending: false })
    .limit(6);

  return (
    <AppShell title="Get Featured" name={profile.fullName}>
      <section className="mt-6 border border-brand-200 bg-soft p-6 sm:p-8">
        <p className="eyebrow">Put your work in front of the community</p>
        <h2 className="mt-3 max-w-4xl text-3xl font-normal tracking-[0.02em] text-ink sm:text-4xl">
          A good idea should not disappear behind your exam schedule.
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          Tell Magna-Q what you are researching, building, teaching or
          organizing. Our team reviews every request and selects projects that
          can inspire collaborators at every stage of the licensing journey.
        </p>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-muted">
          Share your research papers, hypotheses, or anything you want extra
          visibility on.
        </p>
        <FeatureSubmissionForm
          userId={profile.id}
          username={profile.username}
        />
      </section>

      <section className="mt-12" aria-labelledby="featured-members">
        <p className="eyebrow">Community spotlights</p>
        <h2
          id="featured-members"
          className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink"
        >
          Current members featured
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Discover what students and doctors around you are creating, give
          promising work a pulse, and start thoughtful conversations without
          leaving Magna-Q.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(features as CommunityFeature[] | null)?.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
        {!features?.length && (
          <p className="mt-8 border border-dashed border-line bg-field p-8 text-center text-muted">
            The next group of community features is being selected now.
          </p>
        )}
      </section>
    </AppShell>
  );
}
