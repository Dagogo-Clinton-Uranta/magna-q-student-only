import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { ResidencyEventTable } from "@/components/resources/residency-event-table";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  RESIDENCY_EVENT_DIRECTORY_COLUMNS,
  type ResidencyEventDirectoryRow,
} from "@/lib/residencies/events";
import { createClient } from "@/lib/supabase/server";

type TrackingRecord = { event_id: string; tracked_at: string };

export default async function TrackedOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ removed?: string }>;
}) {
  const [profile, params] = await Promise.all([
    requireOnboardedProfile(),
    searchParams,
  ]);
  const supabase = await createClient();
  const { data: trackedData, error: trackingError } = await supabase
    .from("tracked_residency_events")
    .select("event_id,tracked_at")
    .eq("user_id", profile.id)
    .order("tracked_at", { ascending: false });
  if (trackingError)
    throw new Error("Unable to load your tracked opportunities.");

  const tracking = (trackedData ?? []) as TrackingRecord[];
  const eventIds = tracking.map((record) => record.event_id);
  const { data: eventData, error: eventError } = eventIds.length
    ? await supabase
        .from("residency_event_directory")
        .select(RESIDENCY_EVENT_DIRECTORY_COLUMNS)
        .in("id", eventIds)
    : { data: [], error: null };
  if (eventError) throw new Error("Unable to load your tracked event details.");

  const eventById = new Map(
    ((eventData ?? []) as unknown as ResidencyEventDirectoryRow[]).map(
      (event) => [event.id, event],
    ),
  );
  const rows = tracking.flatMap((record) => {
    const event = eventById.get(record.event_id);
    return event ? [event] : [];
  });

  return (
    <AppShell title="Tracked opportunities" name={profile.fullName}>
      <div className="mt-6">
        <Link href="/profile" className="font-bold text-brand-700">
          ← Back to profile
        </Link>
      </div>

      <WorkspaceHero image="guidelines" className="mt-6">
        <p className="eyebrow">Your private event list</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Open houses and networking events you starred
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Return to saved opportunities, confirm registration details, and
          maintain private notes for questions, conversations, and follow-up.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="bg-white px-3 py-2 text-sm font-bold text-slate-800">
            {rows.length} {rows.length === 1 ? "opportunity" : "opportunities"}
          </span>
          <Link
            href="/resources/open-house-opportunities"
            className="button-ghost text-brand-700"
          >
            Browse opportunities →
          </Link>
        </div>
      </WorkspaceHero>

      {params.removed === "1" && (
        <div
          role="status"
          className="mt-6 border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900"
        >
          The opportunity was removed from your tracked events.
        </div>
      )}

      <section className="mt-8" aria-labelledby="tracked-opportunities-title">
        <h2 id="tracked-opportunities-title" className="sr-only">
          Tracked residency opportunities
        </h2>
        {rows.length > 0 ? (
          <ResidencyEventTable
            rows={rows}
            viewBasePath="/profile/tracked-opportunities"
          />
        ) : (
          <div className="border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h3 className="text-xl text-slate-900">
              No tracked opportunities yet
            </h3>
            <p className="mt-2 text-slate-600">
              Open an event and select Star opportunity to add it here.
            </p>
            <Link
              href="/resources/open-house-opportunities"
              className="button-primary mt-5"
            >
              Explore opportunities
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
