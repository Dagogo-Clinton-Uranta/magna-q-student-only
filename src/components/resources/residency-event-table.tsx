import Link from "next/link";
import {
  displayEventValue,
  eventScheduleDate,
  formatEventTime,
  type ResidencyEventDirectoryRow,
} from "@/lib/residencies/events";

export function ResidencyEventTable({
  rows,
  compact = false,
  startIndex = 0,
  viewBasePath = "/resources/open-house-opportunities",
}: {
  rows: ResidencyEventDirectoryRow[];
  compact?: boolean;
  startIndex?: number;
  viewBasePath?: string;
}) {
  return (
    <div className="overflow-x-auto border border-slate-200 bg-white">
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead className="bg-slate-950 text-xs uppercase tracking-wider text-white">
          <tr>
            <th scope="col" className="w-14 px-4 py-4 text-center font-bold">
              S/N
            </th>
            <th scope="col" className="px-4 py-4 font-bold">
              Opportunity
            </th>
            <th scope="col" className="px-4 py-4 font-bold">
              Institution
            </th>
            <th scope="col" className="px-4 py-4 font-bold">
              Date and time
            </th>
            <th scope="col" className="px-4 py-4 font-bold">
              Format
            </th>
            <th scope="col" className="px-4 py-4 font-bold">
              Location
            </th>
            {!compact && (
              <>
                <th scope="col" className="px-4 py-4 font-bold">
                  Access
                </th>
                <th scope="col" className="px-4 py-4 font-bold">
                  <span className="sr-only">Actions</span>
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((event, index) => (
            <tr key={event.id} className="align-top hover:bg-brand-50/50">
              <td className="px-4 py-4 text-center font-bold text-slate-500">
                {startIndex + index + 1}
              </td>
              <td className="max-w-[21rem] px-4 py-4">
                <p className="font-bold leading-5 text-slate-950">
                  {event.event_name}
                </p>
                <p className="mt-1 text-xs capitalize text-slate-500">
                  {displayEventValue(event.event_type)}
                </p>
              </td>
              <td className="max-w-[18rem] px-4 py-4">
                <p className="font-semibold leading-5 text-slate-900">
                  {event.institution_names.join(", ") ||
                    "Institution not listed"}
                </p>
                {event.specialties.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    {event.specialties.join(", ")}
                  </p>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-slate-800">
                <p className="font-semibold">
                  {eventScheduleDate(event, "short")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {event.event_date
                    ? formatEventTime(
                        event.start_time,
                        event.end_time,
                        event.time_zone,
                      )
                    : "Exact date to be announced"}
                </p>
              </td>
              <td className="px-4 py-4">
                <FormatBadge format={event.format} />
              </td>
              <td className="px-4 py-4 text-slate-700">
                <p>{programLocations(event)}</p>
                {event.platform_or_location && (
                  <p className="mt-1 text-xs text-slate-500">
                    {event.platform_or_location}
                  </p>
                )}
              </td>
              {!compact && (
                <>
                  <td className="px-4 py-4">
                    <p className="text-xs font-semibold text-slate-700">
                      {event.registration_required === true
                        ? "Registration required"
                        : event.registration_required === false
                          ? "No registration listed"
                          : "Confirm registration"}
                    </p>
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`${viewBasePath}/${event.id}`}
                      className="button-primary min-h-10 px-5 py-2 text-xs"
                      aria-label={`View details for ${event.event_name}`}
                    >
                      View
                    </Link>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormatBadge({
  format,
}: {
  format: ResidencyEventDirectoryRow["format"];
}) {
  return (
    <span
      className={`inline-flex px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
        format === "virtual"
          ? "bg-sky-100 text-sky-800"
          : format === "in_person"
            ? "bg-emerald-100 text-emerald-800"
            : format === "hybrid"
              ? "bg-violet-100 text-violet-800"
              : "bg-amber-100 text-amber-900"
      }`}
    >
      {format ? displayEventValue(format) : "Confirm format"}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: ResidencyEventDirectoryRow["status"];
}) {
  return (
    <span
      className={`mt-2 inline-flex px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
        status === "upcoming"
          ? "bg-emerald-100 text-emerald-800"
          : status === "cancelled"
            ? "bg-red-100 text-red-800"
            : "bg-slate-100 text-slate-700"
      }`}
    >
      {displayEventValue(status)}
    </span>
  );
}

function programLocations(event: ResidencyEventDirectoryRow) {
  if (event.cities.length === 0 && event.states.length === 0) {
    return "Location not listed";
  }
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
