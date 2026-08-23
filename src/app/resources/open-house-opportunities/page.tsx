import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ResidencyEventTable } from "@/components/resources/residency-event-table";
import { SearchableFilter } from "@/components/resources/searchable-filter";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  EVENT_FORMATS,
  EVENT_SORTS,
  EVENTS_PER_PAGE,
  eventDirectoryHref,
  isEventFormat,
  isEventSort,
  parseEventFilterOptions,
  RESIDENCY_EVENT_DIRECTORY_COLUMNS,
  type ResidencyEventDirectoryRow,
} from "@/lib/residencies/events";
import { createClient } from "@/lib/supabase/server";

type SearchValue = string | string[] | undefined;

export default async function OpenHouseOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: SearchValue;
    from?: SearchValue;
    to?: SearchValue;
    institution?: SearchValue;
    format?: SearchValue;
    location?: SearchValue;
    sort?: SearchValue;
  }>;
}) {
  const profile = await requireOnboardedProfile();
  const requested = await searchParams;
  const supabase = await createClient();
  const { data: rawOptions, error: optionsError } = await supabase.rpc(
    "get_residency_event_filter_options",
  );
  if (optionsError) throw new Error("Unable to load opportunity filters.");

  const options = parseEventFilterOptions(rawOptions);
  const from = validDate(firstValue(requested.from));
  const to = validDate(firstValue(requested.to));
  const requestedInstitution = firstValue(requested.institution);
  const institution = options.institutions.some(
    (option) => option.value === requestedInstitution,
  )
    ? requestedInstitution
    : "";
  const requestedLocation = firstValue(requested.location);
  const location = options.locations.some(
    (option) => option.value === requestedLocation,
  )
    ? requestedLocation
    : "";
  const requestedFormat = firstValue(requested.format);
  const format = isEventFormat(requestedFormat) ? requestedFormat : "";
  const requestedSort = firstValue(requested.sort);
  const sort = isEventSort(requestedSort) ? requestedSort : "soonest";
  const requestedPage = Number(firstValue(requested.page) || "1");

  if (!Number.isInteger(requestedPage) || requestedPage < 1) {
    redirect(
      eventDirectoryHref({
        page: 1,
        from,
        to,
        institution,
        format,
        location,
        sort,
      }),
    );
  }

  const offset = (requestedPage - 1) * EVENTS_PER_PAGE;
  let query = supabase
    .from("residency_event_directory")
    .select(RESIDENCY_EVENT_DIRECTORY_COLUMNS, { count: "exact" })
    .order("event_date", { ascending: sort === "soonest" })
    .order("start_time", {
      ascending: sort === "soonest",
      nullsFirst: false,
    })
    .order("id", { ascending: true })
    .range(offset, offset + EVENTS_PER_PAGE - 1);

  if (from) query = query.gte("event_date", from);
  if (to) query = query.lte("event_date", to);
  if (institution) query = query.contains("program_ids", [institution]);
  if (format) query = query.eq("format", format);
  if (location) query = query.contains("location_keys", [location]);

  const { data, count, error } = await query;
  if (error) throw new Error("Unable to load residency opportunities.");

  const totalResults = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / EVENTS_PER_PAGE));
  if (requestedPage > totalPages) {
    redirect(
      eventDirectoryHref({
        page: totalPages,
        from,
        to,
        institution,
        format,
        location,
        sort,
      }),
    );
  }

  const rows = (data ?? []) as unknown as ResidencyEventDirectoryRow[];
  const firstResult = totalResults === 0 ? 0 : offset + 1;
  const lastResult = Math.min(offset + rows.length, totalResults);
  const hasFilters = Boolean(from || to || institution || format || location);

  return (
    <AppShell title="Open houses and networking" name={profile.fullName}>
      <section className="mt-6 border border-brand-200 bg-soft p-6 sm:p-8">
        <p className="eyebrow">Meet programs before interview season</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-normal tracking-[0.02em] text-ink sm:text-4xl">
          Find applicant events worth showing up for
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Explore residency open houses, program overviews, information
          sessions, resident Q&amp;As, and networking opportunities. Filter the
          list around your calendar, then star events and keep private notes in
          your Profile.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <span className="bg-white px-3 py-2 font-bold text-slate-800">
            {totalResults} matching opportunities
          </span>
          <span className="text-slate-600">
            Event details checked August 23, 2026
          </span>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/resources" className="font-bold text-brand-700">
          ← All resources
        </Link>
        <p className="text-sm text-slate-500">
          Confirm times and registration details with the event source before
          attending.
        </p>
      </div>

      <form
        method="get"
        className="mt-6 grid gap-4 border border-slate-200 bg-white p-5 md:grid-cols-2 xl:grid-cols-4"
      >
        <div>
          <label htmlFor="event-from" className={filterLabelClassName}>
            From date
          </label>
          <input
            id="event-from"
            name="from"
            type="date"
            defaultValue={from}
            className={filterInputClassName}
          />
        </div>
        <div>
          <label htmlFor="event-to" className={filterLabelClassName}>
            To date
          </label>
          <input
            id="event-to"
            name="to"
            type="date"
            defaultValue={to}
            className={filterInputClassName}
          />
        </div>
        <SearchableFilter
          key={`institution-${institution}`}
          label="Institution"
          name="institution"
          options={options.institutions}
          defaultValue={institution}
          placeholder="Type an institution"
        />
        <SearchableFilter
          key={`location-${location}`}
          label="Location"
          name="location"
          options={options.locations}
          defaultValue={location}
          placeholder="Type a city or state"
        />
        <div>
          <label htmlFor="event-format" className={filterLabelClassName}>
            Attendance format
          </label>
          <select
            id="event-format"
            name="format"
            defaultValue={format}
            className={filterInputClassName}
          >
            <option value="">Any format</option>
            {EVENT_FORMATS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="event-sort" className={filterLabelClassName}>
            Sort opportunities
          </label>
          <select
            id="event-sort"
            name="sort"
            defaultValue={sort}
            className={filterInputClassName}
          >
            {EVENT_SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2 md:col-span-2">
          <button type="submit" className="button-primary min-w-28">
            Filter
          </button>
          {(hasFilters || sort !== "soonest") && (
            <Link
              href="/resources/open-house-opportunities"
              className="button-ghost"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      <section className="mt-7" aria-labelledby="opportunity-results-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Opportunity results</p>
            <h2 id="opportunity-results-title" className="mt-2 text-2xl">
              Residency applicant events
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-600">
            Showing {firstResult}–{lastResult} of {totalResults}
          </p>
        </div>

        {rows.length > 0 ? (
          <ResidencyEventTable rows={rows} startIndex={offset} />
        ) : (
          <div className="border border-slate-200 bg-white px-6 py-12 text-center">
            <h3 className="text-xl text-slate-900">
              No matching opportunities
            </h3>
            <p className="mt-2 text-slate-600">
              Try widening the date range or clearing one of the filters.
            </p>
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          aria-label="Opportunity directory pages"
        >
          {requestedPage > 1 && (
            <Link
              href={eventDirectoryHref({
                page: requestedPage - 1,
                from,
                to,
                institution,
                format,
                location,
                sort,
              })}
              className={paginationLinkClassName}
            >
              ← Previous
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <Link
                key={page}
                href={eventDirectoryHref({
                  page,
                  from,
                  to,
                  institution,
                  format,
                  location,
                  sort,
                })}
                aria-current={page === requestedPage ? "page" : undefined}
                className={`flex h-11 min-w-11 items-center justify-center border px-3 font-semibold ${
                  page === requestedPage
                    ? "border-black bg-black text-white"
                    : "border-line bg-white text-body"
                }`}
              >
                {page}
              </Link>
            ),
          )}
          {requestedPage < totalPages && (
            <Link
              href={eventDirectoryHref({
                page: requestedPage + 1,
                from,
                to,
                institution,
                format,
                location,
                sort,
              })}
              className={paginationLinkClassName}
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </AppShell>
  );
}

const filterLabelClassName =
  "text-xs font-bold uppercase tracking-wider text-slate-600";
const filterInputClassName =
  "mt-2 h-12 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none hover:border-brand-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-200";
const paginationLinkClassName =
  "flex h-11 items-center border border-line bg-white px-4 font-semibold text-body";

function firstValue(value: SearchValue) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
    ? value
    : "";
}
