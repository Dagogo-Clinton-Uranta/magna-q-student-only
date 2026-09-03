import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MIGRATIONS_DIR = path.join(ROOT, "supabase", "migrations");
const OUTPUT_DIR = path.join(ROOT, "research", "residency-img");
const SNAPSHOT_PATH = path.join(OUTPUT_DIR, "freida-2026.json");
const SQL_PATH = path.join(
  MIGRATIONS_DIR,
  "202609030002_import_residency_img_metrics.sql",
);
const CHECKED_ON = new Date().toISOString().slice(0, 10);
const CONCURRENCY = positiveInteger(process.env.IMG_RESEARCH_CONCURRENCY, 4);
const REQUEST_DELAY_MS = positiveInteger(
  process.env.IMG_RESEARCH_DELAY_MS,
  350,
);
const REQUEST_TIMEOUT_MS = positiveInteger(
  process.env.IMG_RESEARCH_TIMEOUT_MS,
  30_000,
);

type ResearchStatus = "available" | "not_reported" | "not_found" | "error";

type ResearchRecord = {
  acgmeId: string;
  status: ResearchStatus;
  checkedOn: string;
  imgPercentage: number | null;
  reportingYear: number | null;
  sourceUpdatedAt: string | null;
  sourceUrl: string;
  error: string | null;
};

type Snapshot = {
  source: string;
  checkedOn: string;
  methodology: string;
  records: ResearchRecord[];
};

async function main() {
  const acgmeIds = await readAcgmeIds();
  const previous = await readSnapshot();
  const records = new Map(
    previous?.records.map((record) => [record.acgmeId, record]) ?? [],
  );
  const pending = acgmeIds.filter((acgmeId) => {
    const record = records.get(acgmeId);
    return !record || record.status === "error";
  });

  console.log(
    `Researching ${pending.length} of ${acgmeIds.length} FREIDA program pages with concurrency ${CONCURRENCY}.`,
  );

  let completed = 0;
  let checkpoint = Promise.resolve();
  await runWorkers(pending, async (acgmeId) => {
    const record = await researchProgram(acgmeId);
    records.set(acgmeId, record);
    completed += 1;

    if (completed % 25 === 0 || completed === pending.length) {
      checkpoint = checkpoint.then(() =>
        writeSnapshot(acgmeIds, records).then(() => {
          console.log(`Checked ${completed}/${pending.length} pending programs.`);
        }),
      );
      await checkpoint;
    }
  });
  await checkpoint;

  const snapshot = await writeSnapshot(acgmeIds, records);
  await fs.writeFile(SQL_PATH, buildSql(snapshot), "utf8");

  const available = snapshot.records.filter(
    (record) => record.status === "available",
  ).length;
  const unavailable = snapshot.records.length - available;
  console.log(
    `Finished: ${available} percentages available; ${unavailable} unavailable or errored.`,
  );
  console.log(`Snapshot: ${path.relative(ROOT, SNAPSHOT_PATH)}`);
  console.log(`Migration: ${path.relative(ROOT, SQL_PATH)}`);
}

async function readAcgmeIds() {
  const migrationFiles = (await fs.readdir(MIGRATIONS_DIR))
    .filter((name) => name.endsWith(".sql"))
    .sort();
  const ids = new Set<string>();

  for (const file of migrationFiles) {
    const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    for (const match of sql.matchAll(/"acgme_id"\s*:\s*"([^"]+)"/g)) {
      if (match[1]) ids.add(match[1]);
    }
  }

  return [...ids].sort((left, right) => left.localeCompare(right, "en"));
}

async function researchProgram(acgmeId: string): Promise<ResearchRecord> {
  const sourceUrl = `https://freida.ama-assn.org/program/${encodeURIComponent(acgmeId)}/program-work-schedule`;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(sourceUrl, {
        headers: {
          "user-agent":
            "MagnaQ residency directory research/1.0 (source verification; rate limited)",
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.status === 404) {
        return unavailableRecord(acgmeId, sourceUrl, "not_found", null);
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const percentage = numberField(html, "field_pct_img");
      const reportingYear = surveyYear(html);
      const sourceUpdatedAt = surveyReceivedDate(html);

      if (percentage === null) {
        return unavailableRecord(acgmeId, sourceUrl, "not_reported", null);
      }
      if (percentage < 0 || percentage > 100) {
        throw new Error(`invalid IMG percentage ${percentage}`);
      }

      return {
        acgmeId,
        status: "available",
        checkedOn: CHECKED_ON,
        imgPercentage: percentage,
        reportingYear,
        sourceUpdatedAt,
        sourceUrl,
        error: null,
      };
    } catch (error) {
      if (attempt === 3) {
        return unavailableRecord(
          acgmeId,
          sourceUrl,
          "error",
          error instanceof Error ? error.message : String(error),
        );
      }
      await delay(attempt * 1_000);
    } finally {
      await delay(REQUEST_DELAY_MS);
    }
  }

  return unavailableRecord(acgmeId, sourceUrl, "error", "unknown error");
}

function numberField(html: string, field: string) {
  const match = html.match(
    new RegExp(`"${field}":(?:"([0-9.]+)"|([0-9.]+)|null)`),
  );
  const value = match?.[1] ?? match?.[2];
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function surveyYear(html: string) {
  const surveyMatch = html.match(/"type":"node--survey_(20\d{2})"/);
  if (surveyMatch?.[1]) return Number(surveyMatch[1]);
  const academicMatch = html.match(/"field_academic_year":(20\d{2})/);
  return academicMatch?.[1] ? Number(academicMatch[1]) : null;
}

function surveyReceivedDate(html: string) {
  const match = html.match(/Survey Received:\s*(\d{1,2})\/(\d{1,2})\/(20\d{2})/);
  if (!match) return null;
  const [, month, day, year] = match;
  return `${year}-${month?.padStart(2, "0")}-${day?.padStart(2, "0")}`;
}

function unavailableRecord(
  acgmeId: string,
  sourceUrl: string,
  status: Exclude<ResearchStatus, "available">,
  error: string | null,
): ResearchRecord {
  return {
    acgmeId,
    status,
    checkedOn: CHECKED_ON,
    imgPercentage: null,
    reportingYear: null,
    sourceUpdatedAt: null,
    sourceUrl,
    error,
  };
}

async function runWorkers<T>(items: T[], work: (item: T) => Promise<void>) {
  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (nextIndex < items.length) {
        const item = items[nextIndex];
        nextIndex += 1;
        if (item !== undefined) await work(item);
      }
    }),
  );
}

async function readSnapshot(): Promise<Snapshot | null> {
  try {
    const snapshot = JSON.parse(
      await fs.readFile(SNAPSHOT_PATH, "utf8"),
    ) as Snapshot;
    return {
      ...snapshot,
      records: snapshot.records.map((record) => ({
        ...record,
        checkedOn: record.checkedOn ?? snapshot.checkedOn,
      })),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function writeSnapshot(
  acgmeIds: string[],
  records: Map<string, ResearchRecord>,
) {
  const snapshot: Snapshot = {
    source: "AMA FREIDA",
    checkedOn: CHECKED_ON,
    methodology:
      "FREIDA describes resident/fellow characteristics as three-year averages. IMG resident share is not an applicant acceptance rate or an annual Match outcome.",
    records: acgmeIds.flatMap((acgmeId) => {
      const record = records.get(acgmeId);
      return record ? [record] : [];
    }),
  };
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}

function buildSql(snapshot: Snapshot) {
  const researchStatuses = snapshot.records.map((record) => ({
    acgme_id: record.acgmeId,
    status: record.status,
    source_url: record.sourceUrl,
    date_checked: record.checkedOn,
    error_detail: record.error,
  }));
  const available = snapshot.records.flatMap((record) => {
    if (
      record.status !== "available" ||
      record.imgPercentage === null ||
      record.reportingYear === null
    ) {
      return [];
    }
    return [
      {
        acgme_id: record.acgmeId,
        reporting_year: record.reportingYear,
        img_percentage: record.imgPercentage,
        source_updated_at: record.sourceUpdatedAt,
        source_url: record.sourceUrl,
        date_checked: record.checkedOn,
      },
    ];
  });
  const statusJson = JSON.stringify(researchStatuses, null, 2);
  const metricJson = JSON.stringify(available, null, 2);

  return `begin;

with research_statuses as (
  select *
  from jsonb_to_recordset(
    $img_research_statuses$
${statusJson}
    $img_research_statuses$::jsonb
  ) as row(
    acgme_id text,
    status text,
    source_url text,
    date_checked date,
    error_detail text
  )
)
insert into public.residency_img_research_status (
  residency_id,
  status,
  source_url,
  date_checked,
  error_detail
)
select
  residency.id,
  research_statuses.status,
  research_statuses.source_url,
  research_statuses.date_checked,
  research_statuses.error_detail
from research_statuses
join public.residencies as residency
  on residency.acgme_id = research_statuses.acgme_id
on conflict (residency_id)
do update set
  status = excluded.status,
  source_url = excluded.source_url,
  date_checked = excluded.date_checked,
  error_detail = excluded.error_detail;

with researched as (
  select *
  from jsonb_to_recordset(
    $img_metrics$
${metricJson}
    $img_metrics$::jsonb
  ) as row(
    acgme_id text,
    reporting_year smallint,
    img_percentage numeric,
    source_updated_at date,
    source_url text,
    date_checked date
  )
)
insert into public.residency_img_metrics (
  residency_id,
  reporting_year,
  period_kind,
  metric_type,
  img_percentage,
  source_name,
  source_url,
  source_updated_at,
  date_checked,
  methodology_note
)
select
  residency.id,
  researched.reporting_year,
  'three_year_average',
  'img_resident_share',
  researched.img_percentage,
  'AMA FREIDA',
  researched.source_url,
  researched.source_updated_at,
  researched.date_checked,
  'FREIDA reports resident/fellow characteristics as three-year averages. This is the share of current residents who are IMGs, not an IMG applicant acceptance rate.'
from researched
join public.residencies as residency
  on residency.acgme_id = researched.acgme_id
on conflict (residency_id, reporting_year, period_kind, metric_type, source_url)
do update set
  img_percentage = excluded.img_percentage,
  source_updated_at = excluded.source_updated_at,
  date_checked = excluded.date_checked,
  methodology_note = excluded.methodology_note;

do $$
declare
  imported_count integer;
  research_status_count integer;
begin
  select count(*) into imported_count
  from public.residency_img_metrics
  where source_name = 'AMA FREIDA';

  if imported_count <> ${available.length} then
    raise exception 'Expected ${available.length} FREIDA IMG metrics, found %', imported_count;
  end if;

  select count(*) into research_status_count
  from public.residency_img_research_status;

  if research_status_count <> ${snapshot.records.length} then
    raise exception 'Expected ${snapshot.records.length} IMG research statuses, found %', research_status_count;
  end if;
end;
$$;

commit;
`;
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
