import Link from "next/link";
import { notFound } from "next/navigation";
import {
  saveResidencyEventNotes,
  trackResidencyEvent,
  untrackResidencyEvent,
} from "@/app/profile/opportunity-actions";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  displayEventValue,
  eventScheduleDate,
  eventIdSchema,
  formatEventDate,
  formatEventTime,
  RESIDENCY_EVENT_DIRECTORY_COLUMNS,
  type ResidencyEventDirectoryRow,
} from "@/lib/residencies/events";
import { createClient } from "@/lib/supabase/server";

export type ResidencyEventDetailScreenProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    tracking?: string;
    trackingError?: string;
    notes?: string;
  }>;
};

export async function ResidencyEventDetailScreen({
  params,
  searchParams,
  context,
}: ResidencyEventDetailScreenProps & { context: "directory" | "tracked" }) {
  const profile = await requireOnboardedProfile();
  const [{ id }, pageState] = await Promise.all([params, searchParams]);
  const parsedId = eventIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("residency_event_directory")
    .select(RESIDENCY_EVENT_DIRECTORY_COLUMNS)
    .eq("id", parsedId.data)
    .maybeSingle();
  if (error) throw new Error("Unable to load this residency opportunity.");
  if (!data) notFound();

  const { data: tracking, error: trackingError } = await supabase
    .from("tracked_residency_events")
    .select("notes,tracked_at")
    .eq("user_id", profile.id)
    .eq("event_id", parsedId.data)
    .maybeSingle();
  if (trackingError) {
    throw new Error("Unable to load your tracking status for this event.");
  }
  if (context === "tracked" && !tracking) notFound();

  const event = data as unknown as ResidencyEventDirectoryRow;
  const mapQuery =
    event.format !== "virtual" && event.platform_or_location
      ? event.platform_or_location
      : [event.institution_names[0], event.cities[0], event.states[0], "USA"]
          .filter(Boolean)
          .join(", ");
  const mapUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null;

  return (
    <AppShell
      title={context === "tracked" ? "Tracked opportunity" : "Event details"}
      name={profile.fullName}
    >
      <div className="mt-6">
        <Link
          href={
            context === "tracked"
              ? "/profile/tracked-opportunities"
              : "/resources/open-house-opportunities"
          }
          className="font-bold text-brand-700"
        >
          ← Back to{" "}
          {context === "tracked" ? "tracked opportunities" : "opportunities"}
        </Link>
      </div>

      <WorkspaceHero image="guidelines" className="mt-6">
        <p className="eyebrow capitalize">
          {displayEventValue(event.event_type)}
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl font-normal tracking-[0.02em] text-ink sm:text-4xl">
          {event.event_name}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
          {event.institution_names.map((institution) => (
            <span key={institution} className="bg-white px-3 py-2">
              {institution}
            </span>
          ))}
          {event.specialties.map((specialty) => (
            <span key={specialty} className="bg-white px-3 py-2">
              {specialty}
            </span>
          ))}
          <span className="bg-white px-3 py-2 capitalize">
            {displayEventValue(event.format)}
          </span>
        </div>
        <p className="mt-6 max-w-4xl text-base leading-8 text-slate-700">
          {event.notes ??
            "Review the event schedule and official source before registering or attending."}
        </p>
      </WorkspaceHero>

      <DetailSection eyebrow="Schedule" title="Date, time and attendance">
        <DetailGrid>
          <DetailItem label="Event date" value={eventScheduleDate(event)} />
          <DetailItem
            label="Event time"
            value={formatEventTime(
              event.start_time,
              event.end_time,
              event.time_zone,
            )}
          />
          <DetailItem label="Format" value={displayEventValue(event.format)} />
          <DetailItem label="Status" value={displayEventValue(event.status)} />
          <DetailItem
            label="Registration"
            value={booleanValue(
              event.registration_required,
              "Required",
              "Not listed as required",
            )}
          />
          <DetailItem
            label="Program leadership"
            value={booleanValue(event.program_leadership_present)}
          />
          <DetailItem
            label="Residents present"
            value={booleanValue(event.residents_present)}
          />
          <DetailItem
            label="Q&A available"
            value={booleanValue(event.qa_available)}
          />
        </DetailGrid>
      </DetailSection>

      <DetailSection
        eyebrow="Who and where"
        title="Audience and event location"
      >
        <DetailGrid>
          <DetailItem
            label="Event scope"
            value={displayEventValue(event.event_scope)}
          />
          <DetailItem label="Who can attend" value={event.who_can_attend} />
          <DetailItem
            label="Platform or venue"
            value={event.platform_or_location}
          />
          <DetailItem
            label="Institution location"
            value={eventLocation(event)}
          />
        </DetailGrid>
        {mapUrl && event.format !== "virtual" && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="button-ghost mt-5 px-0 text-brand-700"
          >
            Open institution location in Google Maps ↗
          </a>
        )}
      </DetailSection>

      <DetailSection eyebrow="Attend" title="Registration and official links">
        <p className="max-w-3xl leading-7 text-slate-600">
          Event details can change. Open the official source to confirm the
          time, eligibility, capacity, and registration instructions before
          making plans.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {event.registration_url && (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noreferrer"
              className="button-primary"
            >
              Registration information ↗
            </a>
          )}
          {event.event_url && event.event_url !== event.registration_url && (
            <a
              href={event.event_url}
              target="_blank"
              rel="noreferrer"
              className="button-primary"
            >
              Open event page ↗
            </a>
          )}
          {event.source_url && (
            <a
              href={event.source_url}
              target="_blank"
              rel="noreferrer"
              className="button-ghost border border-slate-300 bg-white"
            >
              View source ↗
            </a>
          )}
        </div>
      </DetailSection>

      <DetailSection eyebrow="Data context" title="Currency and verification">
        <DetailGrid>
          <DetailItem
            label="Information checked"
            value={formatEventDate(event.date_checked)}
          />
          <DetailItem
            label="Source type"
            value={displayEventValue(event.source_type)}
          />
          <DetailItem
            label="Source verification flag"
            value={
              event.source_verified ? "Verified" : "Not yet marked verified"
            }
          />
          <DetailItem
            label="Linked ACGME IDs"
            value={event.acgme_ids.join(", ")}
          />
        </DetailGrid>
      </DetailSection>

      {context === "tracked" && tracking ? (
        <TrackedEventTools
          eventId={parsedId.data}
          notes={tracking.notes}
          pageState={pageState}
        />
      ) : (
        <DirectoryEventTrackingControl
          eventId={parsedId.data}
          isTracked={Boolean(tracking)}
          pageState={pageState}
        />
      )}
    </AppShell>
  );
}

function DirectoryEventTrackingControl({
  eventId,
  isTracked,
  pageState,
}: {
  eventId: string;
  isTracked: boolean;
  pageState: Awaited<ResidencyEventDetailScreenProps["searchParams"]>;
}) {
  return (
    <section id="tracking" className={trackingSectionClassName}>
      <p className="eyebrow">Your opportunity list</p>
      <h2 className="mt-2 text-2xl">
        {isTracked ? "★ Opportunity starred" : "Star this opportunity"}
      </h2>
      {pageState.tracking === "added" && (
        <StatusMessage>
          Your tracked opportunities have been updated.
        </StatusMessage>
      )}
      {pageState.trackingError && <TrackingError />}
      {isTracked ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
          <p className="max-w-3xl leading-7 text-slate-600">
            This event is saved in your Profile, where you can review it and
            maintain private preparation and follow-up notes.
          </p>
          <Link
            href={`/profile/tracked-opportunities/${eventId}`}
            className="button-primary"
          >
            Open tracked opportunity
          </Link>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
          <p className="max-w-3xl leading-7 text-slate-600">
            Star this event so you can return to it from your Profile and keep
            private notes before or after attending.
          </p>
          <form action={trackResidencyEvent}>
            <input type="hidden" name="eventId" value={eventId} />
            <FormSubmitButton
              pendingLabel="Starring…"
              className="button-primary min-w-52"
            >
              ☆ Star opportunity
            </FormSubmitButton>
          </form>
        </div>
      )}
    </section>
  );
}

function TrackedEventTools({
  eventId,
  notes,
  pageState,
}: {
  eventId: string;
  notes: string;
  pageState: Awaited<ResidencyEventDetailScreenProps["searchParams"]>;
}) {
  return (
    <section id="tracking" className={trackingSectionClassName}>
      <p className="eyebrow">Your tracked opportunity</p>
      <h2 className="mt-2 text-2xl">Private event notes</h2>
      {pageState.notes === "saved" && (
        <StatusMessage>Your private notes have been saved.</StatusMessage>
      )}
      {pageState.trackingError && <TrackingError />}

      <form action={saveResidencyEventNotes} className="mt-6">
        <input type="hidden" name="eventId" value={eventId} />
        <label htmlFor="event-notes" className="block">
          <span className="font-bold text-slate-950">Private notes</span>
          <span className="mt-2 block max-w-4xl text-sm leading-6 text-slate-600">
            Capture questions to ask, people you met, application insights,
            registration reminders, and follow-up actions.
          </span>
        </label>
        <textarea
          id="event-notes"
          name="notes"
          rows={8}
          maxLength={10000}
          defaultValue={notes}
          className="mt-4 w-full border border-slate-300 bg-white p-4 leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-200"
          placeholder="Add private notes about this opportunity…"
        />
        <p className="mt-2 text-xs text-slate-500">
          These notes are private to your account.
        </p>
        <div className="mt-4 max-w-xs">
          <FormSubmitButton pendingLabel="Saving notes…">
            Save notes
          </FormSubmitButton>
        </div>
      </form>

      <div className="mt-8 border-t border-brand-200 pt-6">
        <form action={untrackResidencyEvent}>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="context" value="tracked" />
          <FormSubmitButton
            pendingLabel="Removing…"
            className="button-ghost border border-slate-300 bg-white"
          >
            Remove from tracked opportunities
          </FormSubmitButton>
        </form>
      </div>
    </section>
  );
}

const trackingSectionClassName =
  "mt-8 border border-brand-300 bg-soft p-6 sm:p-8";

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
  value: string | null | undefined;
}) {
  return (
    <div className="border-l-2 border-brand-300 bg-slate-50 px-4 py-4">
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 leading-6 text-slate-900">
        {value || "Not currently listed"}
      </dd>
    </div>
  );
}

function booleanValue(value: boolean | null, yes = "Yes", no = "No") {
  return value === true ? yes : value === false ? no : "Not currently listed";
}

function eventLocation(event: ResidencyEventDirectoryRow) {
  if (event.cities.length === 1 && event.states.length === 1) {
    return `${event.cities[0]}, ${event.states[0]}`;
  }
  return event.location_keys
    .map((location) => {
      const [state, city] = location.split("|");
      return [city, state].filter(Boolean).join(", ");
    })
    .join(" · ");
}

function TrackingError() {
  return (
    <div
      role="alert"
      className="mt-5 border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-900"
    >
      We could not update this opportunity right now. Please try again.
    </div>
  );
}

function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      className="mt-5 border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900"
    >
      {children}
    </div>
  );
}
