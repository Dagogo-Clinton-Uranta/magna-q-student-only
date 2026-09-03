import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { ResidencyDirectoryTable } from "@/components/resources/residency-directory-table";
import { SearchableFilter } from "@/components/resources/searchable-filter";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  directoryHref,
  DIRECTORY_SORT_OPTIONS,
  getDirectoryResearchDate,
  isDirectorySort,
  isVisaFilter,
  parseFilterOptions,
  RESIDENCIES_PER_PAGE,
  RESIDENCY_DIRECTORY_COLUMNS,
  type ResidencyDirectoryRow,
  VISA_FILTERS,
} from "@/lib/residencies/directory";
import { createClient } from "@/lib/supabase/server";

type SearchValue = string | string[] | undefined;

export default async function ResidencyDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: SearchValue;
    specialty?: SearchValue;
    location?: SearchValue;
    visa?: SearchValue;
    sort?: SearchValue;
    imgData?: SearchValue;
  }>;
}) {
  const profile = await requireOnboardedProfile();
  const requestedFilters = await searchParams;
  const supabase = await createClient();
  const { data: rawOptions, error: optionsError } = await supabase.rpc(
    "get_residency_filter_options",
  );
  if (optionsError) throw new Error("Unable to load residency filters.");

  const options = parseFilterOptions(rawOptions);
  const requestedSpecialty = firstValue(requestedFilters.specialty);
  const requestedLocation = firstValue(requestedFilters.location);
  const requestedVisa = firstValue(requestedFilters.visa);
  const requestedSort = firstValue(requestedFilters.sort);
  const specialty = options.specialties.some(
    (option) => option.value === requestedSpecialty,
  )
    ? requestedSpecialty
    : "";
  const location = options.locations.some(
    (option) => option.value === requestedLocation,
  )
    ? requestedLocation
    : "";
  const visa = isVisaFilter(requestedVisa) ? requestedVisa : "";
  const sort = isDirectorySort(requestedSort) ? requestedSort : "default";
  const imgDataOnly = firstValue(requestedFilters.imgData) === "available";
  const requestedPage = Number(firstValue(requestedFilters.page) || "1");

  if (!Number.isInteger(requestedPage) || requestedPage < 1) {
    redirect(
      directoryHref({
        page: 1,
        specialty,
        location,
        visa,
        sort,
        imgDataOnly,
      }),
    );
  }

  const from = (requestedPage - 1) * RESIDENCIES_PER_PAGE;
  let directoryQuery = supabase
    .from("residencies")
    .select(RESIDENCY_DIRECTORY_COLUMNS, { count: "exact" });

  if (specialty) {
    directoryQuery = directoryQuery.eq("specialty", specialty);
  }
  if (location) {
    const [state, ...cityParts] = location.split("|");
    directoryQuery = directoryQuery
      .eq("state", state)
      .eq("city", cityParts.join("|"));
  }
  if (visa === "j1") {
    directoryQuery = directoryQuery
      .eq("visa_filter_ready", true)
      .eq("j1_sponsorship", "Yes");
  } else if (visa === "h1b") {
    directoryQuery = directoryQuery
      .eq("visa_filter_ready", true)
      .eq("h1b_sponsorship", "Yes");
  } else if (visa === "both") {
    directoryQuery = directoryQuery
      .eq("visa_filter_ready", true)
      .eq("j1_sponsorship", "Yes")
      .eq("h1b_sponsorship", "Yes");
  } else if (visa === "either") {
    directoryQuery = directoryQuery
      .eq("visa_filter_ready", true)
      .or("j1_sponsorship.eq.Yes,h1b_sponsorship.eq.Yes");
  } else if (visa === "none-listed") {
    directoryQuery = directoryQuery.eq(
      "visa_friendliness",
      "no_listed_visa_route",
    );
  } else if (visa === "review") {
    directoryQuery = directoryQuery.eq("visa_filter_ready", false);
  }

  if (imgDataOnly) {
    directoryQuery = directoryQuery.not("img_resident_percentage", "is", null);
  }

  if (sort === "img-desc") {
    directoryQuery = directoryQuery
      .order("img_resident_percentage", {
        ascending: false,
        nullsFirst: false,
      })
      .order("source_order", { ascending: true })
      .order("id", { ascending: true });
  } else {
    directoryQuery = directoryQuery
      .order("source_order", { ascending: true })
      .order("id", { ascending: true });
  }

  directoryQuery = directoryQuery.range(
    from,
    from + RESIDENCIES_PER_PAGE - 1,
  );

  const { data, count, error } = await directoryQuery;
  if (error) throw new Error("Unable to load the residency directory.");

  const totalResults = count ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalResults / RESIDENCIES_PER_PAGE),
  );
  if (requestedPage > totalPages) {
    redirect(
      directoryHref({
        page: totalPages,
        specialty,
        location,
        visa,
        sort,
        imgDataOnly,
      }),
    );
  }

  const rows = (data ?? []) as unknown as ResidencyDirectoryRow[];
  const firstResult = totalResults === 0 ? 0 : from + 1;
  const lastResult = Math.min(from + rows.length, totalResults);
  const displayedResearchDate = getDirectoryResearchDate();

  return (
    <AppShell title="Residency directory" name={profile.fullName}>
      <WorkspaceHero image="journey" className="mt-6">
        <p className="eyebrow">Explore U.S. training programs</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-normal tracking-[0.02em] text-ink sm:text-4xl">
          Build a broader, better-informed residency list
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Compare specialties, locations, training environments, application
          details, and currently listed visa routes. Use the directory to
          strengthen your program research and discover options that may not yet
          be on your radar.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <span className="bg-white px-3 py-2 font-bold text-slate-800">
            {totalResults} matching programs
          </span>
          <span className="text-slate-600">
            Dataset researched {displayedResearchDate}
          </span>
        </div>
      </WorkspaceHero>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/resources" className="font-bold text-brand-700">
          ← All resources
        </Link>
        <p className="text-sm text-slate-500">
          Always confirm requirements directly with the program before applying
          or signaling.
        </p>
      </div>

      <form
        method="get"
        className="mt-6 grid gap-4 border border-slate-200 bg-white p-5 lg:grid-cols-2 xl:grid-cols-4 xl:items-end"
      >
        <SearchableFilter
          key={`specialty-${specialty}`}
          label="Specialty"
          name="specialty"
          options={options.specialties}
          defaultValue={specialty}
          placeholder="Type to find a specialty"
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
          <label
            htmlFor="visa-filter"
            className="text-xs font-bold uppercase tracking-wider text-slate-600"
          >
            Visa sponsorship
          </label>
          <select
            id="visa-filter"
            name="visa"
            defaultValue={visa}
            className="mt-2 h-12 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none hover:border-brand-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-200"
          >
            <option value="">Any visa information</option>
            {VISA_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="directory-sort"
            className="text-xs font-bold uppercase tracking-wider text-slate-600"
          >
            Sort results
          </label>
          <select
            id="directory-sort"
            name="sort"
            defaultValue={sort}
            className="mt-2 h-12 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none hover:border-brand-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-200"
          >
            {DIRECTORY_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 lg:col-span-2 xl:col-span-4">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              name="imgData"
              value="available"
              defaultChecked={imgDataOnly}
              className="h-4 w-4 accent-blue-700"
            />
            Exclude programs without IMG percentage data
          </label>
          <div className="flex gap-2">
            <button type="submit" className="button-primary min-w-28">
              Filter
            </button>
            {(specialty ||
              location ||
              visa ||
              sort !== "default" ||
              imgDataOnly) && (
              <Link
                href="/resources/residency-directory"
                className="button-ghost"
              >
                Reset
              </Link>
            )}
          </div>
        </div>
      </form>

      <section className="mt-7" aria-labelledby="directory-results-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Directory results</p>
            <h2 id="directory-results-title" className="mt-2 text-2xl">
              U.S. residency programs
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-600">
            Showing {firstResult}–{lastResult} of {totalResults}
          </p>
        </div>

        {rows.length > 0 ? (
          <ResidencyDirectoryTable rows={rows} startIndex={from} />
        ) : (
          <div className="border border-slate-200 bg-white px-6 py-12 text-center">
            <h3 className="text-xl text-slate-900">No matching programs</h3>
            <p className="mt-2 text-slate-600">
              Try clearing one filter or selecting a broader visa option.
            </p>
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          aria-label="Residency directory pages"
        >
          {requestedPage > 1 && (
            <Link
              href={directoryHref({
                page: requestedPage - 1,
                specialty,
                location,
                visa,
                sort,
                imgDataOnly,
              })}
              className="flex h-11 items-center border border-line bg-white px-4 font-semibold text-body"
            >
              ← Previous
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <Link
                key={page}
                href={directoryHref({
                  page,
                  specialty,
                  location,
                  visa,
                  sort,
                  imgDataOnly,
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
              href={directoryHref({
                page: requestedPage + 1,
                specialty,
                location,
                visa,
                sort,
                imgDataOnly,
              })}
              className="flex h-11 items-center border border-line bg-white px-4 font-semibold text-body"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </AppShell>
  );
}

function firstValue(value: SearchValue) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}
