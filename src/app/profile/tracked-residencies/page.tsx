import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { ResidencyDirectoryTable } from "@/components/resources/residency-directory-table";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  RESIDENCY_DIRECTORY_COLUMNS,
  type ResidencyDirectoryRow,
} from "@/lib/residencies/directory";
import { createClient } from "@/lib/supabase/server";

type TrackedResidencyRecord = {
  tracked_at: string;
  residency: ResidencyDirectoryRow | ResidencyDirectoryRow[] | null;
};

export default async function TrackedResidenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ removed?: string }>;
}) {
  const [profile, params] = await Promise.all([
    requireOnboardedProfile(),
    searchParams,
  ]);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracked_residencies")
    .select(
      `tracked_at,residency:residencies!tracked_residencies_residency_id_fkey(${RESIDENCY_DIRECTORY_COLUMNS})`,
    )
    .eq("user_id", profile.id)
    .order("tracked_at", { ascending: false });

  if (error) throw new Error("Unable to load your tracked residencies.");

  const trackedRows = (
    (data ?? []) as unknown as TrackedResidencyRecord[]
  ).flatMap((record) => {
    if (Array.isArray(record.residency)) return record.residency;
    return record.residency ? [record.residency] : [];
  });

  return (
    <AppShell title="Tracked residencies" name={profile.fullName}>
      <div className="mt-6">
        <Link href="/profile" className="font-bold text-brand-700">
          ← Back to profile
        </Link>
      </div>

      <WorkspaceHero image="journey" className="mt-6">
        <p className="eyebrow">Your private shortlist</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Programs you are actively considering
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Return to saved programs, review their details, and maintain private
          notes for interviews, social events, connections, and applications.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="bg-white px-3 py-2 text-sm font-bold text-slate-800">
            {trackedRows.length}{" "}
            {trackedRows.length === 1 ? "program" : "programs"}
          </span>
          <Link
            href="/resources/residency-directory"
            className="button-ghost text-brand-700"
          >
            Browse directory →
          </Link>
        </div>
      </WorkspaceHero>

      {params.removed === "1" && (
        <div
          role="status"
          className="mt-6 border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900"
        >
          The residency was removed from your tracked programs.
        </div>
      )}

      <section className="mt-8" aria-labelledby="tracked-programs-title">
        <h2 id="tracked-programs-title" className="sr-only">
          Tracked residency programs
        </h2>
        {trackedRows.length > 0 ? (
          <ResidencyDirectoryTable
            rows={trackedRows}
            viewBasePath="/profile/tracked-residencies"
          />
        ) : (
          <div className="border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h3 className="text-xl text-slate-900">
              No tracked residencies yet
            </h3>
            <p className="mt-2 text-slate-600">
              Open a program in the residency directory and select Track
              residency to add it here.
            </p>
            <Link
              href="/resources/residency-directory"
              className="button-primary mt-5"
            >
              Explore programs
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
