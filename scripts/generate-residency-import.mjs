import fs from "node:fs";

const [inputPath, outputPath, firstSourceOrder, expectedTotal, batchLabel] =
  process.argv.slice(2);

if (
  !inputPath ||
  !outputPath ||
  !firstSourceOrder ||
  !expectedTotal ||
  !batchLabel
) {
  throw new Error(
    "Usage: node scripts/generate-residency-import.mjs <input.csv> <output.sql> <first-source-order> <expected-total> <batch-label>",
  );
}

function parseCsv(contents) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];

    if (quoted) {
      if (character === '"' && contents[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(value);
      value = "";
    } else if (character === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (quoted) throw new Error("CSV contains an unterminated quoted value.");
  if (value || row.length) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows;
}

const columnTypes = {
  acgme_id: "text",
  program_name: "text",
  specialty: "text",
  city: "text",
  state: "text",
  location_filter_key: "text",
  specialty_filter_key: "text",
  accepting_applications: "text",
  source_last_updated: "text",
  research_date: "text",
  program_length_years: "text",
  first_year_positions: "text",
  program_size: "text",
  avg_work_hours: "text",
  program_setting: "text",
  application_service: "text",
  about_program: "text",
  notable_features: "text",
  interview_format: "text",
  interviews_last_year: "text",
  interviews_per_first_year_position: "text",
  img_step1_required: "text",
  img_step2_required: "text",
  medical_school_graduation_within_years: "text",
  gap_experience_requirement: "text",
  j1_sponsorship: "text",
  h1b_sponsorship: "text",
  f1_opt_first_year: "text",
  visa_friendliness: "text",
  visa_filter_ready: "text",
  moonlighting_beyond_pgy1: "text",
  night_float: "text",
  structured_didactics_hours: "text",
  research_rotation: "text",
  source_type: "text",
  source_url: "text",
  verification_status: "text",
  current_information_warning: "text",
};

const requiredColumns = new Set([
  "city",
  "state",
  "specialty",
  "about_program",
  "application_service",
  "source_last_updated",
]);
const booleanColumns = new Set([
  "accepting_applications",
  "visa_filter_ready",
]);
const unknownPattern = /^(?:unknown|unkown)$/i;

function normalizeValue(column, value) {
  const trimmed = value.trim();
  if (!trimmed || unknownPattern.test(trimmed)) return null;

  if (booleanColumns.has(column)) {
    if (/^(?:true|yes|y|1)$/i.test(trimmed)) return "true";
    if (/^(?:false|no|n|0)$/i.test(trimmed)) return "false";
    if (column === "accepting_applications" && /participating/i.test(trimmed)) {
      return "true";
    }
    throw new Error(`Cannot normalize ${column} value: ${trimmed}`);
  }

  return trimmed;
}

const parsedRows = parseCsv(fs.readFileSync(inputPath, "utf8"));
const headers = parsedRows.shift();
const expectedHeaders = Object.keys(columnTypes);

if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
  throw new Error("CSV headers do not match the residency import schema.");
}

const dataRows = parsedRows.filter((row) => row.some((value) => value.trim()));
const firstOrder = Number.parseInt(firstSourceOrder, 10);
const finalTotal = Number.parseInt(expectedTotal, 10);

if (!Number.isSafeInteger(firstOrder) || !Number.isSafeInteger(finalTotal)) {
  throw new Error("Source order and expected total must be integers.");
}

const records = dataRows.map((row, rowIndex) => {
  if (row.length !== headers.length) {
    throw new Error(
      `CSV row ${rowIndex + 2} has ${row.length} values; expected ${headers.length}.`,
    );
  }

  const record = { source_order: firstOrder + rowIndex };
  headers.forEach((header, columnIndex) => {
    record[header] = normalizeValue(header, row[columnIndex]);
  });

  for (const column of requiredColumns) {
    if (record[column] === null) {
      throw new Error(`CSV row ${rowIndex + 2} is missing required ${column}.`);
    }
  }

  return record;
});

const uniqueIds = new Set(records.map((record) => record.acgme_id));
if (uniqueIds.size !== records.length) {
  throw new Error("CSV contains duplicate ACGME IDs.");
}

const endOrder = firstOrder + records.length - 1;
if (finalTotal !== endOrder) {
  throw new Error(
    `Expected total ${finalTotal} does not match final source order ${endOrder}.`,
  );
}

const columns = ["source_order", ...expectedHeaders];
const recordDefinitions = columns
  .map((column) => `    ${column} ${column === "source_order" ? "text" : columnTypes[column]}`)
  .join(",\n");
const insertColumns = columns.map((column) => `  ${column}`).join(",\n");
const selectCasts = {
  source_order: "source_order::smallint",
  accepting_applications: "accepting_applications::boolean",
  research_date: "research_date::date",
  program_length_years: "program_length_years::smallint",
  program_size: "program_size::smallint",
  avg_work_hours: "avg_work_hours::numeric",
  interviews_last_year: "interviews_last_year::smallint",
  interviews_per_first_year_position:
    "interviews_per_first_year_position::numeric",
  visa_filter_ready: "visa_filter_ready::boolean",
};
const selectColumns = columns
  .map((column) => `  ${selectCasts[column] ?? column}`)
  .join(",\n");
const updateColumns = columns
  .filter((column) => column !== "acgme_id")
  .map((column) => `  ${column} = excluded.${column}`)
  .join(",\n");

const sql = `begin;

alter table public.residencies
  drop constraint if exists residencies_acgme_id_check;

alter table public.residencies
  add constraint residencies_acgme_id_check
  check (acgme_id ~ '^[0-9]+(-[A-Z]+)?$');

with raw_rows as (
  select *
  from jsonb_to_recordset(
    $residency_data$
${JSON.stringify(records, null, 2)}
$residency_data$::jsonb
  ) as row(
${recordDefinitions}
  )
)
insert into public.residencies (
${insertColumns}
)
select
${selectColumns}
from raw_rows
on conflict (acgme_id) do update set
${updateColumns};

do $$
declare
  imported_count integer;
  batch_count integer;
  literal_unknown_count integer;
begin
  select count(*) into imported_count from public.residencies;
  if imported_count <> ${finalTotal} then
    raise exception 'Expected ${finalTotal} unique residency rows after the ${batchLabel} import, found %', imported_count;
  end if;

  select count(*) into batch_count
  from public.residencies
  where source_order between ${firstOrder} and ${endOrder};
  if batch_count <> ${records.length} then
    raise exception 'Expected ${records.length} residency rows in the ${batchLabel} batch, found %', batch_count;
  end if;

  select count(*) into literal_unknown_count
  from public.residencies as residency
  cross join lateral jsonb_each_text(to_jsonb(residency)) as entry
  where lower(btrim(entry.value)) in ('unknown', 'unkown');
  if literal_unknown_count <> 0 then
    raise exception 'Expected optional unknown values to be null, found % literals', literal_unknown_count;
  end if;
end;
$$;

commit;
`;

fs.writeFileSync(outputPath, sql);
console.log(
  `Generated ${outputPath} with ${records.length} rows (${firstOrder}-${endOrder}).`,
);
