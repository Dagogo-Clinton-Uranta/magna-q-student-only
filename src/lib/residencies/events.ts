import { z } from "zod";
import type {
  ResidencyFilterOption,
  ResidencyFilterOptions,
} from "@/lib/residencies/directory";

export const EVENTS_PER_PAGE = 25;

export const RESIDENCY_EVENT_DIRECTORY_COLUMNS = [
  "id",
  "event_type",
  "event_name",
  "event_date",
  "published_timing",
  "listed_institution_name",
  "listed_specialty",
  "listed_acgme_id",
  "start_time",
  "end_time",
  "time_zone",
  "format",
  "platform_or_location",
  "event_scope",
  "who_can_attend",
  "program_leadership_present",
  "residents_present",
  "qa_available",
  "registration_required",
  "registration_url",
  "event_url",
  "status",
  "source_verified",
  "source_type",
  "source_url",
  "date_checked",
  "notes",
  "program_ids",
  "institution_names",
  "specialties",
  "acgme_ids",
  "cities",
  "states",
  "location_keys",
  "institution_keys",
].join(",");

export type ResidencyEventDirectoryRow = {
  id: string;
  event_type: string;
  event_name: string;
  event_date: string | null;
  published_timing: string | null;
  listed_institution_name: string | null;
  listed_specialty: string | null;
  listed_acgme_id: string | null;
  start_time: string | null;
  end_time: string | null;
  time_zone: string | null;
  format: "virtual" | "in_person" | "hybrid" | "unknown" | null;
  platform_or_location: string | null;
  event_scope: string | null;
  who_can_attend: string | null;
  program_leadership_present: boolean | null;
  residents_present: boolean | null;
  qa_available: boolean | null;
  registration_required: boolean | null;
  registration_url: string | null;
  event_url: string | null;
  status: "upcoming" | "completed" | "cancelled" | "postponed" | "unknown";
  source_verified: boolean;
  source_type: string | null;
  source_url: string | null;
  date_checked: string;
  notes: string | null;
  program_ids: string[];
  institution_names: string[];
  specialties: string[];
  acgme_ids: string[];
  cities: string[];
  states: string[];
  location_keys: string[];
  institution_keys: string[];
};

export type ResidencyEventFilterOptions = ResidencyFilterOptions & {
  institutions: ResidencyFilterOption[];
};

export const EVENT_FORMATS = [
  { value: "virtual", label: "Virtual" },
  { value: "in_person", label: "In person" },
  { value: "hybrid", label: "Hybrid" },
  { value: "unknown", label: "Format needs confirmation" },
] as const;

export const EVENT_SORTS = [
  { value: "soonest", label: "Date: soonest first" },
  { value: "latest", label: "Date: latest first" },
] as const;

export const EVENT_SCHEDULE_FILTERS = [
  { value: "dated", label: "Exact date available" },
  { value: "tbd", label: "Date to be announced" },
] as const;

export type EventFormatFilter = (typeof EVENT_FORMATS)[number]["value"];
export type EventSort = (typeof EVENT_SORTS)[number]["value"];
export type EventScheduleFilter =
  (typeof EVENT_SCHEDULE_FILTERS)[number]["value"];

export const eventIdSchema = z.string().uuid();
export const eventNotesSchema = z.object({
  eventId: eventIdSchema,
  notes: z.string().max(10000),
});

export function isEventFormat(value: string): value is EventFormatFilter {
  return EVENT_FORMATS.some((option) => option.value === value);
}

export function isEventSort(value: string): value is EventSort {
  return EVENT_SORTS.some((option) => option.value === value);
}

export function isEventScheduleFilter(
  value: string,
): value is EventScheduleFilter {
  return EVENT_SCHEDULE_FILTERS.some((option) => option.value === value);
}

export function parseEventFilterOptions(
  value: unknown,
): ResidencyEventFilterOptions {
  if (!value || typeof value !== "object") {
    return { institutions: [], specialties: [], locations: [] };
  }
  const record = value as Record<string, unknown>;
  return {
    institutions: parseOptions(record.institutions),
    locations: parseOptions(record.locations),
    specialties: [],
  };
}

function parseOptions(value: unknown): ResidencyFilterOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (
      item &&
      typeof item === "object" &&
      "label" in item &&
      typeof item.label === "string" &&
      "value" in item &&
      typeof item.value === "string"
    ) {
      return [{ label: item.label, value: item.value }];
    }
    return [];
  });
}

export function eventDirectoryHref({
  page,
  from,
  to,
  institution,
  format,
  location,
  schedule,
  sort,
}: {
  page: number;
  from?: string;
  to?: string;
  institution?: string;
  format?: string;
  location?: string;
  schedule?: string;
  sort?: string;
}) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (institution) params.set("institution", institution);
  if (format) params.set("format", format);
  if (location) params.set("location", location);
  if (schedule) params.set("schedule", schedule);
  if (sort && sort !== "soonest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/resources/open-house-opportunities${query ? `?${query}` : ""}`;
}

export function formatEventDate(
  value: string | null,
  style: "short" | "long" = "long",
) {
  if (!value) return "Date to be announced";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: style === "short" ? "short" : "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function eventScheduleDate(
  event: Pick<ResidencyEventDirectoryRow, "event_date" | "published_timing">,
  style: "short" | "long" = "long",
) {
  return event.event_date
    ? formatEventDate(event.event_date, style)
    : event.published_timing || "Date to be announced";
}

export function formatEventTime(
  start: string | null,
  end: string | null,
  timeZone: string | null,
) {
  if (!start) return "Time to be confirmed";
  const normalized = (value: string) => {
    const [hourText = "0", minuteText = "0"] = value.split(":");
    const hour = Number(hourText);
    const minute = Number(minuteText);
    const suffix = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
  };
  const range = end
    ? `${normalized(start)}–${normalized(end)}`
    : normalized(start);
  return `${range}${timeZone ? ` ${timeZone}` : ""}`;
}

export function displayEventValue(value: string | null | undefined) {
  if (!value) return "Not currently listed";
  return value.replaceAll("_", " ");
}
