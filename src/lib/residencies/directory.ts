export const RESIDENCIES_PER_PAGE = 25;

export const RESIDENCY_DIRECTORY_COLUMNS = [
  "id",
  "acgme_id",
  "program_name",
  "specialty",
  "city",
  "state",
  "program_setting",
  "accepting_applications",
  "program_length_years",
  "first_year_positions",
  "program_size",
  "application_service",
  "j1_sponsorship",
  "h1b_sponsorship",
  "visa_filter_ready",
  "visa_friendliness",
].join(",");

export const RESIDENCY_DETAIL_COLUMNS = [
  "id",
  "acgme_id",
  "program_name",
  "specialty",
  "city",
  "state",
  "accepting_applications",
  "source_last_updated",
  "research_date",
  "program_length_years",
  "first_year_positions",
  "program_size",
  "avg_work_hours",
  "program_setting",
  "application_service",
  "about_program",
  "notable_features",
  "interview_format",
  "interviews_last_year",
  "interviews_per_first_year_position",
  "img_step1_required",
  "img_step2_required",
  "medical_school_graduation_within_years",
  "gap_experience_requirement",
  "j1_sponsorship",
  "h1b_sponsorship",
  "f1_opt_first_year",
  "visa_friendliness",
  "visa_filter_ready",
  "moonlighting_beyond_pgy1",
  "night_float",
  "structured_didactics_hours",
  "research_rotation",
  "verification_status",
  "current_information_warning",
].join(",");

export type ResidencyDirectoryRow = {
  id: number;
  acgme_id: string | null;
  program_name: string | null;
  specialty: string;
  city: string;
  state: string;
  program_setting: string | null;
  accepting_applications: boolean | null;
  program_length_years: number | null;
  first_year_positions: string | null;
  program_size: number | null;
  application_service: string | null;
  j1_sponsorship: string | null;
  h1b_sponsorship: string | null;
  visa_filter_ready: boolean | null;
  visa_friendliness: string | null;
};

export type ResidencyDetail = ResidencyDirectoryRow & {
  source_last_updated: string;
  research_date: string | null;
  avg_work_hours: number | null;
  about_program: string;
  notable_features: string | null;
  interview_format: string | null;
  interviews_last_year: number | null;
  interviews_per_first_year_position: number | null;
  img_step1_required: string | null;
  img_step2_required: string | null;
  medical_school_graduation_within_years: string | null;
  gap_experience_requirement: string | null;
  f1_opt_first_year: string | null;
  moonlighting_beyond_pgy1: string | null;
  night_float: string | null;
  structured_didactics_hours: string | null;
  research_rotation: string | null;
  verification_status: string | null;
  current_information_warning: string | null;
};

export type ResidencyFilterOption = {
  label: string;
  value: string;
};

export type ResidencyFilterOptions = {
  specialties: ResidencyFilterOption[];
  locations: ResidencyFilterOption[];
};

export const VISA_FILTERS = [
  { value: "either", label: "J-1 or H-1B listed" },
  { value: "j1", label: "J-1 listed" },
  { value: "h1b", label: "H-1B listed" },
  { value: "both", label: "Both J-1 and H-1B listed" },
  { value: "none-listed", label: "No visa route listed" },
  { value: "review", label: "Visa information needs review" },
] as const;

export type VisaFilter = (typeof VISA_FILTERS)[number]["value"];

export function getDirectoryResearchDate(referenceDate = new Date()) {
  const previousMonthOnTheTwentyFirst = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth() - 1,
      21,
    ),
  );

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(previousMonthOnTheTwentyFirst);
}

export function isVisaFilter(value: string): value is VisaFilter {
  return VISA_FILTERS.some((option) => option.value === value);
}

export function parseFilterOptions(value: unknown): ResidencyFilterOptions {
  if (!value || typeof value !== "object") {
    return { specialties: [], locations: [] };
  }

  const record = value as Record<string, unknown>;
  return {
    specialties: parseOptionList(record.specialties),
    locations: parseOptionList(record.locations),
  };
}

function parseOptionList(value: unknown): ResidencyFilterOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
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

export function directoryHref({
  page,
  specialty,
  location,
  visa,
}: {
  page: number;
  specialty?: string;
  location?: string;
  visa?: string;
}) {
  const params = new URLSearchParams();
  if (specialty) params.set("specialty", specialty);
  if (location) params.set("location", location);
  if (visa) params.set("visa", visa);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/resources/residency-directory${query ? `?${query}` : ""}`;
}
