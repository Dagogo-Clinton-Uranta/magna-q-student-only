import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { z } from "zod";

loadEnvConfig(process.cwd());

const DEFAULT_CSV =
  "00_all_specialties_verified_open_house_events_2026-08-23.csv";
const RESEARCH_NOTE =
  "Applicant event found during a residency event research sweep.";
const FULL_EVENT_HEADERS = [
  "acgme_id",
  "program_name",
  "specialty",
  "event_type",
  "event_name",
  "event_date",
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
  "match_method",
  "match_confidence",
] as const;
const ANESTHESIOLOGY_UNDATED_HEADERS = [
  "program_name",
  "specialty",
  "event_type",
  "published_timing",
  "source_url",
  "reason_not_in_import_csv",
] as const;
const FAMILY_MEDICINE_UNDATED_HEADERS = [
  "program_name",
  "acgme_id_if_confirmed",
  "event_type",
  "published_timing",
  "event_scope",
  "source_url",
  "verification_notes",
] as const;
const SPECIALTY_SCOPED_UNDATED_HEADERS = [
  "program_name",
  "acgme_id_if_confirmed",
  "specialty",
  "event_type",
  "published_timing",
  "event_scope",
  "source_url",
  "verification_notes",
] as const;
const INTERNAL_MEDICINE_UNDATED_HEADERS = [
  "program_name",
  "acgme_id_if_confirmed",
  "event_type",
  "published_timing",
  "source_url",
  "reason_not_in_import_csv",
] as const;
type CsvHeader =
  | (typeof FULL_EVENT_HEADERS)[number]
  | (typeof ANESTHESIOLOGY_UNDATED_HEADERS)[number]
  | (typeof FAMILY_MEDICINE_UNDATED_HEADERS)[number]
  | (typeof SPECIALTY_SCOPED_UNDATED_HEADERS)[number]
  | (typeof INTERNAL_MEDICINE_UNDATED_HEADERS)[number];
type RawCsvRow = Record<CsvHeader, string>;

const eventStatuses = [
  "upcoming",
  "completed",
  "cancelled",
  "postponed",
  "unknown",
] as const;
const eventFormats = ["virtual", "in_person", "hybrid", "unknown"] as const;

type NullableBoolean = boolean | null;
type EventStatus = (typeof eventStatuses)[number];
type EventFormat = (typeof eventFormats)[number];

type ParsedEventRow = {
  rowNumber: number;
  acgme_id: string | null;
  program_name: string;
  specialty: string;
  event_type: string;
  event_name: string;
  event_date: string | null;
  published_timing: string | null;
  listed_institution_name: string;
  listed_specialty: string;
  listed_acgme_id: string | null;
  start_time: string | null;
  end_time: string | null;
  time_zone: string | null;
  format: EventFormat | null;
  platform_or_location: string | null;
  event_scope: string | null;
  who_can_attend: string | null;
  program_leadership_present: NullableBoolean;
  residents_present: NullableBoolean;
  qa_available: NullableBoolean;
  registration_required: NullableBoolean;
  registration_url: string | null;
  event_url: string | null;
  status: EventStatus;
  source_verified: boolean;
  source_type: string | null;
  source_url: string;
  date_checked: string;
  notes: string | null;
  match_method: string | null;
  match_confidence: number | null;
};

type Program = {
  id: string;
  acgme_id: string;
  program_name: string;
  specialty: string;
};

type ExistingEvent = {
  id: string;
  event_name: string;
  event_date: string | null;
  source_url: string;
};

type ImportResult = {
  matched: boolean;
  event_id?: string;
  event_inserted?: boolean;
  link_created?: boolean;
  research_status_updated?: boolean;
};

type ImportSummary = {
  csvRowsProcessed: number;
  residenciesMatched: number;
  residenciesUnmatched: number;
  eventsInserted: number;
  eventsUpdated: number;
  linksCreated: number;
  existingLinksSkipped: number;
  researchStatusesUpdated: number;
  invalidRows: number;
  errors: number;
};

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isRealDate, "must be a real YYYY-MM-DD date");
const timeSchema = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/);
const httpUrlSchema = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), "must use HTTP or HTTPS");

function isRealDate(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableBoolean(value: string): NullableBoolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "unknown") return null;
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  throw new Error(
    `expected true, false, unknown or empty; received “${value}”`,
  );
}

function sourceVerifiedBoolean(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  throw new Error(`expected true, false or empty; received “${value}”`);
}

function required(value: string, field: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} is required`);
  return trimmed;
}

function optionalUrl(value: string, field: string) {
  const normalized = optionalText(value);
  if (normalized === null) return null;
  const result = httpUrlSchema.safeParse(normalized);
  if (!result.success) throw new Error(`${field} must be a valid HTTP(S) URL`);
  return result.data;
}

function eventIdentity(
  row: Pick<ParsedEventRow, "event_name" | "event_date" | "source_url">,
) {
  return `${row.event_name}\u0000${row.event_date ?? "<undated>"}\u0000${row.source_url}`;
}

function parseCsv(csvPath: string) {
  const matrix = parse(fs.readFileSync(csvPath, "utf8"), {
    bom: true,
    skip_empty_lines: true,
    relax_column_count: false,
  }) as string[][];

  const [headers, ...rows] = matrix;
  const csvShape = identifyCsvShape(headers);
  if (!headers || !csvShape) {
    throw new Error(
      `CSV headers do not match the expected schema. Received: ${headers?.join(", ") ?? "none"}`,
    );
  }

  const validRows: ParsedEventRow[] = [];
  const invalidRows: Array<{ rowNumber: number; error: string }> = [];
  let blankSourceVerifiedCount = 0;

  rows.forEach((values, index) => {
    const rowNumber = index + 2;
    try {
      if (values.length !== headers.length) {
        throw new Error(
          `expected ${headers.length} columns; received ${values.length}`,
        );
      }
      const raw = Object.fromEntries(
        headers.map((header, column) => [header, values[column] ?? ""]),
      ) as RawCsvRow;
      if (csvShape === "full" && !raw.source_verified.trim()) {
        blankSourceVerifiedCount += 1;
      }
      validRows.push(
        csvShape === "full"
          ? parseFullEventRow(raw, rowNumber, csvPath)
          : parseUndatedLeadRow(raw, rowNumber, csvShape, csvPath),
      );
    } catch (error) {
      invalidRows.push({
        rowNumber,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  return {
    validRows,
    invalidRows,
    blankSourceVerifiedCount,
    total: rows.length,
  };
}

function identifyCsvShape(headers: string[] | undefined) {
  if (!headers) return null;
  if (sameHeaders(headers, FULL_EVENT_HEADERS)) return "full" as const;
  if (sameHeaders(headers, ANESTHESIOLOGY_UNDATED_HEADERS)) {
    return "anesthesiology-undated" as const;
  }
  if (sameHeaders(headers, FAMILY_MEDICINE_UNDATED_HEADERS)) {
    return "scoped-undated" as const;
  }
  if (sameHeaders(headers, SPECIALTY_SCOPED_UNDATED_HEADERS)) {
    return "scoped-undated" as const;
  }
  if (sameHeaders(headers, INTERNAL_MEDICINE_UNDATED_HEADERS)) {
    return "unscoped-undated-with-acgme" as const;
  }
  return null;
}

function sameHeaders(actual: string[], expected: readonly string[]) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function parseFullEventRow(
  raw: RawCsvRow,
  rowNumber: number,
  csvPath: string,
): ParsedEventRow {
  const eventDateText = optionalText(raw.event_date);
  const eventDate = eventDateText ? dateSchema.parse(eventDateText) : null;
  const checkedDateText = optionalText(raw.date_checked);
  const checkedDate = checkedDateText
    ? dateSchema.parse(checkedDateText)
    : checkedDateFromFilename(csvPath);
  const sourceUrl = httpUrlSchema.parse(
    required(raw.source_url, "source_url"),
  );
  const startTime = optionalText(raw.start_time);
  const endTime = optionalText(raw.end_time);
  if (startTime) timeSchema.parse(startTime);
  if (endTime) timeSchema.parse(endTime);
  const format = optionalText(raw.format);
  if (format && !eventFormats.includes(format as EventFormat)) {
    throw new Error(`format has unsupported value “${format}”`);
  }
  const status = optionalText(raw.status) ?? "upcoming";
  if (!eventStatuses.includes(status as EventStatus)) {
    throw new Error(`status has unsupported value “${status}”`);
  }
  const confidenceText = optionalText(raw.match_confidence);
  const confidence = confidenceText === null ? null : Number(confidenceText);
  if (
    confidence !== null &&
    (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)
  ) {
    throw new Error("match_confidence must be between 0 and 1");
  }
  const acgmeId = optionalText(raw.acgme_id);
  const programName = required(raw.program_name, "program_name");
  const specialty = required(raw.specialty, "specialty");

  return {
    rowNumber,
    acgme_id: acgmeId,
    program_name: programName,
    specialty,
    event_type: required(raw.event_type, "event_type"),
    event_name: required(raw.event_name, "event_name"),
    event_date: eventDate,
    published_timing: null,
    listed_institution_name: programName,
    listed_specialty: specialty,
    listed_acgme_id: acgmeId,
    start_time: startTime,
    end_time: endTime,
    time_zone: optionalText(raw.time_zone),
    format: format as EventFormat | null,
    platform_or_location: optionalText(raw.platform_or_location),
    event_scope: optionalText(raw.event_scope),
    who_can_attend: optionalText(raw.who_can_attend),
    program_leadership_present: nullableBoolean(
      raw.program_leadership_present,
    ),
    residents_present: nullableBoolean(raw.residents_present),
    qa_available: nullableBoolean(raw.qa_available),
    registration_required: nullableBoolean(raw.registration_required),
    registration_url: optionalUrl(raw.registration_url, "registration_url"),
    event_url: optionalUrl(raw.event_url, "event_url"),
    status: status as EventStatus,
    source_verified: sourceVerifiedBoolean(raw.source_verified),
    source_type: optionalText(raw.source_type),
    source_url: sourceUrl,
    date_checked: checkedDate,
    notes: optionalText(raw.notes),
    match_method: optionalText(raw.match_method),
    match_confidence: confidence,
  };
}

function parseUndatedLeadRow(
  raw: RawCsvRow,
  rowNumber: number,
  shape:
    | "anesthesiology-undated"
    | "scoped-undated"
    | "unscoped-undated-with-acgme",
  csvPath: string,
): ParsedEventRow {
  const programName = required(raw.program_name, "program_name");
  const specialty = inferUndatedSpecialty(raw, csvPath);
  const eventType = required(raw.event_type, "event_type");
  const publishedTiming = required(raw.published_timing, "published_timing");
  const sourceUrl = httpUrlSchema.parse(
    required(raw.source_url, "source_url"),
  );
  const acgmeId = optionalText(raw.acgme_id_if_confirmed ?? "");
  const notes = optionalText(
    shape === "scoped-undated"
      ? raw.verification_notes
      : raw.reason_not_in_import_csv,
  );
  const sourceVerified = path
    .basename(csvPath)
    .includes("_undated_verified_leads_");

  return {
    rowNumber,
    acgme_id: acgmeId,
    program_name: programName,
    specialty,
    event_type: eventType,
    event_name: `${programName}: ${eventTypeLabel(eventType)}`,
    event_date: null,
    published_timing: publishedTiming,
    listed_institution_name: programName,
    listed_specialty: specialty,
    listed_acgme_id: acgmeId,
    start_time: null,
    end_time: null,
    time_zone: null,
    format: inferUndatedFormat(eventType),
    platform_or_location: null,
    event_scope: optionalText(raw.event_scope ?? ""),
    who_can_attend: null,
    program_leadership_present: null,
    residents_present: null,
    qa_available: null,
    registration_required: null,
    registration_url: null,
    event_url: sourceUrl,
    status: "upcoming",
    source_verified: sourceVerified,
    source_type: sourceVerified
      ? "verified_undated_lead"
      : "unverified_undated_lead",
    source_url: sourceUrl,
    date_checked: checkedDateFromFilename(csvPath),
    notes,
    match_method: acgmeId ? "source_confirmed_acgme_id" : null,
    match_confidence: acgmeId ? 1 : null,
  };
}

function inferUndatedSpecialty(raw: RawCsvRow, csvPath: string) {
  const supplied = optionalText(raw.specialty ?? "");
  if (supplied) return supplied;
  const filename = path.basename(csvPath).toLowerCase();
  if (filename.includes("internal_medicine")) return "Internal Medicine";
  if (filename.includes("family_medicine")) return "Family Medicine";
  if (filename.includes("pediatrics")) return "Pediatrics";
  if (filename.includes("neurology")) return "Neurology";
  throw new Error("specialty is required or must be inferable from the filename");
}

function eventTypeLabel(eventType: string) {
  return eventType
    .split("_")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function inferUndatedFormat(eventType: string): EventFormat | null {
  if (eventType.includes("virtual")) return "virtual";
  if (eventType.includes("in_person") || eventType === "campus_visit") {
    return "in_person";
  }
  return null;
}

function checkedDateFromFilename(csvPath: string) {
  const dates = path.basename(csvPath).match(/\d{4}-\d{2}-\d{2}/g);
  const value = dates?.at(0) ?? new Date().toISOString().slice(0, 10);
  return dateSchema.parse(value);
}


function chunks<T>(values: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

async function findPrograms(supabase: SupabaseClient<any>, acgmeIds: string[]) {
  const programs: Program[] = [];
  for (const batch of chunks([...new Set(acgmeIds)], 200)) {
    const result = await supabase
      .from("residency_programs")
      .select("id,acgme_id,program_name,specialty")
      .in("acgme_id", batch);
    if (result.error) throw result.error;
    programs.push(...((result.data ?? []) as Program[]));
  }
  return new Map(programs.map((program) => [program.acgme_id, program]));
}

async function findExistingEvents(
  supabase: SupabaseClient<any>,
  rows: ParsedEventRow[],
) {
  if (rows.length === 0) return new Map<string, ExistingEvent>();
  const events: ExistingEvent[] = [];
  for (const batch of chunks(
    [...new Set(rows.map((row) => row.source_url))],
    100,
  )) {
    const result = await supabase
      .from("residency_events")
      .select("id,event_name,event_date,source_url")
      .in("source_url", batch);
    if (result.error) throw result.error;
    events.push(...((result.data ?? []) as ExistingEvent[]));
  }
  return new Map(events.map((event) => [eventIdentity(event), event]));
}

async function findExistingLinks(
  supabase: SupabaseClient<any>,
  eventIds: string[],
) {
  const links = new Set<string>();
  for (const batch of chunks([...new Set(eventIds)], 200)) {
    if (batch.length === 0) continue;
    const result = await supabase
      .from("residency_event_programs")
      .select("event_id,residency_program_id")
      .in("event_id", batch);
    if (result.error) throw result.error;
    for (const link of (result.data ?? []) as Array<{
      event_id: string;
      residency_program_id: string;
    }>) {
      links.add(`${link.event_id}\u0000${link.residency_program_id}`);
    }
  }
  return links;
}

function eventPayload(row: ParsedEventRow) {
  const {
    rowNumber: _rowNumber,
    acgme_id: _acgmeId,
    program_name: _programName,
    specialty: _specialty,
    match_method: _matchMethod,
    match_confidence: _matchConfidence,
    ...event
  } = row;
  return event;
}

function printSummary(
  summary: ImportSummary,
  dryRun: boolean,
  unmatched: ParsedEventRow[],
  invalid: Array<{ rowNumber: number; error: string }>,
  duplicateEventCount: number,
  blankSourceVerifiedCount: number,
) {
  console.log(`\nResidency Event Import ${dryRun ? "Dry Run" : "Complete"}\n`);
  console.log(`CSV rows processed: ${summary.csvRowsProcessed}`);
  console.log(`Rows linked to existing residencies: ${summary.residenciesMatched}`);
  console.log(`Rows imported without a residency link: ${summary.residenciesUnmatched}`);
  console.log(`Events inserted: ${summary.eventsInserted}`);
  console.log(`Events updated: ${summary.eventsUpdated}`);
  console.log(`Program-event links created: ${summary.linksCreated}`);
  console.log(`Existing links skipped: ${summary.existingLinksSkipped}`);
  console.log(`Research statuses updated: ${summary.researchStatusesUpdated}`);
  console.log(`Duplicate event identities in CSV: ${duplicateEventCount}`);
  console.log(
    `Blank source_verified values normalized to false: ${blankSourceVerifiedCount}`,
  );
  console.log(`Invalid rows: ${summary.invalidRows}`);
  console.log(`Errors: ${summary.errors}`);

  if (unmatched.length > 0) {
    console.log("\nEvents imported without a residency link:");
    for (const row of unmatched) {
      console.log(
        `- ACGME ${row.acgme_id ?? "not supplied"} | ${row.program_name} | ${row.specialty} | ${row.event_name}`,
      );
    }
  }
  if (invalid.length > 0) {
    console.log("\nInvalid CSV rows:");
    for (const row of invalid)
      console.log(`- Row ${row.rowNumber}: ${row.error}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const fileArgument = args.find((argument) => !argument.startsWith("--"));
  const csvPath = path.resolve(fileArgument ?? DEFAULT_CSV);
  if (!fs.existsSync(csvPath)) throw new Error(`CSV not found: ${csvPath}`);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(30_000) }),
    },
  });

  const parsed = parseCsv(csvPath);
  const programs = await findPrograms(
    supabase,
    parsed.validRows.flatMap((row) => (row.acgme_id ? [row.acgme_id] : [])),
  );
  const matchedRows = parsed.validRows.filter((row) =>
    row.acgme_id ? programs.has(row.acgme_id) : false,
  );
  const unmatchedRows = parsed.validRows.filter(
    (row) => !row.acgme_id || !programs.has(row.acgme_id),
  );
  const existingEvents = await findExistingEvents(supabase, parsed.validRows);
  const existingLinks = await findExistingLinks(
    supabase,
    [...existingEvents.values()].map((event) => event.id),
  );
  const uniqueEventIdentities = new Set(parsed.validRows.map(eventIdentity));
  const duplicateEventCount = parsed.validRows.length - uniqueEventIdentities.size;
  const uniqueResearchPrograms = new Set(
    matchedRows
      .filter((row) => row.status === "upcoming")
      .flatMap((row) => {
        const program = row.acgme_id ? programs.get(row.acgme_id) : undefined;
        return program ? [program.id] : [];
      }),
  );
  const processedPairs = new Set<string>();

  const summary: ImportSummary = {
    csvRowsProcessed: parsed.total,
    residenciesMatched: matchedRows.length,
    residenciesUnmatched: unmatchedRows.length,
    eventsInserted: [...uniqueEventIdentities].filter(
      (identity) => !existingEvents.has(identity),
    ).length,
    eventsUpdated: [...uniqueEventIdentities].filter((identity) =>
      existingEvents.has(identity),
    ).length,
    linksCreated: 0,
    existingLinksSkipped: 0,
    researchStatusesUpdated: uniqueResearchPrograms.size,
    invalidRows: parsed.invalidRows.length,
    errors: 0,
  };

  for (const row of parsed.validRows) {
    const program = row.acgme_id ? programs.get(row.acgme_id) : undefined;
    const identity = eventIdentity(row);
    const event = existingEvents.get(identity);
    const pairKey = `${identity}\u0000${program?.id ?? "<unlinked>"}`;
    if (processedPairs.has(pairKey)) {
      summary.existingLinksSkipped += 1;
      continue;
    }
    processedPairs.add(pairKey);

    if (dryRun) {
      const linkKey =
        event && program ? `${event.id}\u0000${program.id}` : null;
      if (linkKey && existingLinks.has(linkKey)) {
        summary.existingLinksSkipped += 1;
      } else if (program) {
        summary.linksCreated += 1;
      }
      continue;
    }

    const result = await supabase.rpc("import_residency_event_row", {
      p_acgme_id: row.acgme_id ?? "",
      p_event: eventPayload(row),
      p_match_method: row.match_method,
      p_match_confidence: row.match_confidence,
      p_research_note: RESEARCH_NOTE,
    });
    if (result.error) {
      summary.errors += 1;
      console.error(`Row ${row.rowNumber} failed: ${result.error.message}`);
      continue;
    }
    const imported = result.data as ImportResult;
    if (imported.link_created) {
      summary.linksCreated += 1;
    } else if (imported.matched) {
      summary.existingLinksSkipped += 1;
    }
  }

  printSummary(
    summary,
    dryRun,
    unmatchedRows,
    parsed.invalidRows,
    duplicateEventCount,
    parsed.blankSourceVerifiedCount,
  );
  if (summary.errors > 0 || summary.invalidRows > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
