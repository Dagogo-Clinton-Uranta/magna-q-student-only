import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  RESIDENCY_DETAIL_COLUMNS,
  type ResidencyDetail,
} from "@/lib/residencies/directory";
import { createClient } from "@/lib/supabase/server";

export default async function ResidencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { id } = await params;
  const residencyId = Number(id);

  if (!Number.isSafeInteger(residencyId) || residencyId < 1) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("residencies")
    .select(RESIDENCY_DETAIL_COLUMNS)
    .eq("id", residencyId)
    .maybeSingle();

  if (error) throw new Error("Unable to load this residency program.");
  if (!data) notFound();

  const residency = data as unknown as ResidencyDetail;
  const mapQuery = [
    residency.program_name,
    residency.city,
    residency.state,
    "USA",
  ]
    .filter(Boolean)
    .join(", ");
  const encodedMapQuery = encodeURIComponent(mapQuery);
  const googleMapsEmbedApiKey = process.env.GOOGLE_MAPS_EMBED_API_KEY;
  const mapEmbedUrl = googleMapsEmbedApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(googleMapsEmbedApiKey)}&q=${encodedMapQuery}`
    : null;
  const fullMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;

  return (
    <AppShell title="Residency profile" name={profile.fullName}>
      <div className="mt-6">
        <Link
          href="/resources/residency-directory"
          className="font-bold text-brand-700"
        >
          ← Back to residency directory
        </Link>
      </div>

      <section className="mt-6 border border-brand-200 bg-soft p-6 sm:p-8">
        <p className="eyebrow">{residency.specialty}</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-normal tracking-[0.02em] text-ink sm:text-4xl">
          {residency.program_name ?? "Residency program"}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
          <span className="bg-white px-3 py-2">
            {residency.city}, {residency.state}
          </span>
          {residency.program_setting && (
            <span className="bg-white px-3 py-2">
              {displayValue(residency.program_setting)} setting
            </span>
          )}
          {residency.acgme_id && (
            <span className="bg-white px-3 py-2">
              ACGME ID {residency.acgme_id}
            </span>
          )}
        </div>
        <p className="mt-6 max-w-4xl text-base leading-8 text-slate-700">
          {residency.about_program}
        </p>
      </section>

      <section
        className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]"
        aria-labelledby="location-heading"
      >
        <div className="border border-slate-200 bg-white p-6">
          <p className="eyebrow">Program location</p>
          <h2 id="location-heading" className="mt-2 text-2xl">
            {residency.city}, {residency.state}
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            This map searches using the program name and its listed city and
            state. The marker is a helpful geographic guide, not a verified
            campus or hospital entrance.
          </p>
          <a
            href={fullMapUrl}
            target="_blank"
            rel="noreferrer"
            className="button-ghost mt-4 px-0 text-brand-700"
          >
            Open larger map ↗
          </a>
        </div>
        <div className="min-h-80 overflow-hidden border border-slate-200 bg-slate-100">
          {mapEmbedUrl ? (
            <iframe
              title={`Map showing the listed location of ${residency.program_name ?? "this residency program"}`}
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="min-h-80 border-0"
            />
          ) : (
            <div className="flex min-h-80 items-center justify-center p-8 text-center text-slate-600">
              Map preview is unavailable until the Google Maps Embed API key is
              configured.
            </div>
          )}
        </div>
      </section>

      <DetailSection
        eyebrow="Training"
        title="Training structure and experience"
      >
        <DetailGrid>
          <DetailItem
            label="Program length"
            value={withUnit(residency.program_length_years, "years")}
          />
          <DetailItem
            label="First-year positions"
            value={residency.first_year_positions}
          />
          <DetailItem
            label="Total program size"
            value={residency.program_size}
          />
          <DetailItem
            label="Average weekly work hours"
            value={residency.avg_work_hours}
          />
          <DetailItem
            label="Structured didactics"
            value={withUnit(residency.structured_didactics_hours, "hours")}
          />
          <DetailItem
            label="Night-float system"
            value={residency.night_float}
          />
          <DetailItem
            label="Moonlighting beyond PGY-1"
            value={residency.moonlighting_beyond_pgy1}
          />
          <DetailItem
            label="Research rotation"
            value={residency.research_rotation}
          />
        </DetailGrid>
        <NarrativeBlock
          title="Notable training features"
          value={residency.notable_features}
        />
      </DetailSection>

      <DetailSection eyebrow="Applying" title="Application and interviews">
        <DetailGrid>
          <DetailItem
            label="Application status"
            value={applicationStatus(residency.accepting_applications)}
          />
          <DetailItem
            label="Application service"
            value={residency.application_service}
          />
          <DetailItem
            label="Interview format"
            value={residency.interview_format}
          />
          <DetailItem
            label="Interviews last year"
            value={residency.interviews_last_year}
          />
          <DetailItem
            label="Interviews per first-year position"
            value={residency.interviews_per_first_year_position}
          />
        </DetailGrid>
      </DetailSection>

      <DetailSection
        eyebrow="IMG readiness"
        title="Exam and experience details"
      >
        <DetailGrid>
          <DetailItem
            label="USMLE Step 1 required"
            value={residency.img_step1_required}
          />
          <DetailItem
            label="USMLE Step 2 required"
            value={residency.img_step2_required}
          />
          <DetailItem
            label="Graduation recency"
            value={withUnit(
              residency.medical_school_graduation_within_years,
              "years",
            )}
          />
          <DetailItem
            label="Gap or clinical experience"
            value={residency.gap_experience_requirement}
          />
        </DetailGrid>
      </DetailSection>

      <DetailSection eyebrow="Immigration" title="Listed visa information">
        <p className="mb-5 max-w-3xl leading-7 text-slate-600">
          Visa policies can change and may depend on individual circumstances.
          Treat these entries as research prompts and confirm them directly with
          the program before applying.
        </p>
        <DetailGrid>
          <DetailItem
            label="J-1 sponsorship"
            value={residency.j1_sponsorship}
          />
          <DetailItem
            label="H-1B sponsorship"
            value={residency.h1b_sponsorship}
          />
          <DetailItem
            label="F-1 OPT first year"
            value={residency.f1_opt_first_year}
          />
          <DetailItem
            label="Visa profile"
            value={residency.visa_friendliness}
          />
          <DetailItem
            label="Visa data status"
            value={
              residency.visa_filter_ready === true
                ? "Ready to filter"
                : "Manual verification recommended"
            }
          />
        </DetailGrid>
      </DetailSection>

      <DetailSection eyebrow="Data context" title="Currency and verification">
        <DetailGrid>
          <DetailItem
            label="Program information last updated"
            value={formatDate(residency.source_last_updated)}
          />
          <DetailItem
            label="Research checked"
            value={formatDate(residency.research_date)}
          />
          <DetailItem
            label="Verification status"
            value={residency.verification_status}
          />
        </DetailGrid>
        <NarrativeBlock
          title="Important information note"
          value={residency.current_information_warning}
          tone="warning"
        />
      </DetailSection>
    </AppShell>
  );
}

function DetailSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 border border-slate-200 bg-white p-6 sm:p-8">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-2xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</dl>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="border-l-2 border-brand-300 bg-slate-50 px-4 py-4">
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 leading-6 text-slate-900">{displayValue(value)}</dd>
    </div>
  );
}

function NarrativeBlock({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: string | null;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={`mt-5 border px-5 py-5 ${
        tone === "warning"
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <h3 className="font-bold text-slate-950">{title}</h3>
      <p className="mt-2 leading-7 text-slate-700">{displayValue(value)}</p>
    </div>
  );
}

function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Not currently listed";
  }
  if (typeof value === "number") return value.toLocaleString("en-US");

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return "Yes";
  if (normalized === "false") return "No";
  return value.replaceAll("_", " ");
}

function applicationStatus(value: boolean | null) {
  if (value === true) return "Accepting applications";
  if (value === false) return "Not currently listed as accepting";
  return "Status needs verification";
}

function withUnit(value: string | number | null | undefined, unit: string) {
  if (value === null || value === undefined || value === "") return null;
  return `${value} ${unit}`;
}

function formatDate(value: string | null) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
