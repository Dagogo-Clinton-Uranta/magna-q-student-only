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
  "Upcoming applicant event found during 2026-08-23 residency event research sweep.";
const EXPECTED_HEADERS = [
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
  acgme_id: string;
  program_name: string;
  specialty: string;
  event_type: string;
  event_name: string;
  event_date: string;
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
  event_date: string;
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
  return `${row.event_name}\u0000${row.event_date}\u0000${row.source_url}`;
}

function parseCsv(csvPath: string) {
  const matrix = parse(fs.readFileSync(csvPath, "utf8"), {
    bom: true,
    skip_empty_lines: true,
    relax_column_count: false,
  }) as string[][];

  const [headers, ...rows] = matrix;
  if (
    !headers ||
    JSON.stringify(headers) !== JSON.stringify(EXPECTED_HEADERS)
  ) {
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
      if (values.length !== EXPECTED_HEADERS.length) {
        throw new Error(
          `expected ${EXPECTED_HEADERS.length} columns; received ${values.length}`,
        );
      }
      const raw = Object.fromEntries(
        EXPECTED_HEADERS.map((header, column) => [
          header,
          values[column] ?? "",
        ]),
      ) as Record<(typeof EXPECTED_HEADERS)[number], string>;
      const eventDate = dateSchema.parse(
        required(raw.event_date, "event_date"),
      );
      const checkedDate = dateSchema.parse(
        required(raw.date_checked, "date_checked"),
      );
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
      const status = required(raw.status, "status");
      if (!eventStatuses.includes(status as EventStatus)) {
        throw new Error(`status has unsupported value “${status}”`);
      }
      const confidenceText = optionalText(raw.match_confidence);
      const confidence =
        confidenceText === null ? null : Number(confidenceText);
      if (
        confidence !== null &&
        (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)
      ) {
        throw new Error("match_confidence must be between 0 and 1");
      }
      if (!raw.source_verified.trim()) blankSourceVerifiedCount += 1;

      validRows.push({
        rowNumber,
        acgme_id: required(raw.acgme_id, "acgme_id"),
        program_name: required(raw.program_name, "program_name"),
        specialty: required(raw.specialty, "specialty"),
        event_type: required(raw.event_type, "event_type"),
        event_name: required(raw.event_name, "event_name"),
        event_date: eventDate,
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
      });
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
  const dates = rows.map((row) => row.event_date).sort();
  const result = await supabase
    .from("residency_events")
    .select("id,event_name,event_date,source_url")
    .gte("event_date", dates[0]!)
    .lte("event_date", dates.at(-1)!);
  if (result.error) throw result.error;
  const events = (result.data ?? []) as ExistingEvent[];
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
  console.log(`Residencies matched: ${summary.residenciesMatched}`);
  console.log(`Residencies unmatched: ${summary.residenciesUnmatched}`);
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
    console.log("\nUnmatched programs:");
    for (const row of unmatched) {
      console.log(
        `- ACGME ${row.acgme_id} | ${row.program_name} | ${row.specialty} | ${row.event_name}`,
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
    parsed.validRows.map((row) => row.acgme_id),
  );
  const matchedRows = parsed.validRows.filter((row) =>
    programs.has(row.acgme_id),
  );
  const unmatchedRows = parsed.validRows.filter(
    (row) => !programs.has(row.acgme_id),
  );
  const existingEvents = await findExistingEvents(supabase, matchedRows);
  const existingLinks = await findExistingLinks(
    supabase,
    [...existingEvents.values()].map((event) => event.id),
  );
  const uniqueEventIdentities = new Set(matchedRows.map(eventIdentity));
  const duplicateEventCount = matchedRows.length - uniqueEventIdentities.size;
  const uniqueResearchPrograms = new Set(
    matchedRows
      .filter((row) => row.status === "upcoming")
      .map((row) => programs.get(row.acgme_id)!.id),
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

  for (const row of matchedRows) {
    const program = programs.get(row.acgme_id)!;
    const identity = eventIdentity(row);
    const event = existingEvents.get(identity);
    const pairKey = `${identity}\u0000${program.id}`;
    if (processedPairs.has(pairKey)) {
      summary.existingLinksSkipped += 1;
      continue;
    }
    processedPairs.add(pairKey);

    if (dryRun) {
      const linkKey = event ? `${event.id}\u0000${program.id}` : null;
      if (linkKey && existingLinks.has(linkKey)) {
        summary.existingLinksSkipped += 1;
      } else {
        summary.linksCreated += 1;
      }
      continue;
    }

    const result = await supabase.rpc("import_residency_event_row", {
      p_acgme_id: row.acgme_id,
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
    if (!imported.matched) {
      summary.errors += 1;
      console.error(`Row ${row.rowNumber} lost its ACGME match during import.`);
    } else if (imported.link_created) {
      summary.linksCreated += 1;
    } else {
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
