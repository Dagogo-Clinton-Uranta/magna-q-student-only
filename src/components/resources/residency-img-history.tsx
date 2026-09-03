import {
  metricLabel,
  periodLabel,
  type ResidencyImgMetric,
  type ResidencyImgResearchStatus,
} from "@/lib/residencies/img-metrics";

export function ResidencyImgHistory({
  metrics,
  researchStatus,
}: {
  metrics: ResidencyImgMetric[];
  researchStatus: ResidencyImgResearchStatus | null;
}) {
  const residentShare = metrics
    .filter((metric) => metric.metric_type === "img_resident_share")
    .sort((left, right) => left.reporting_year - right.reporting_year);
  const latest = residentShare.at(-1) ?? metrics.at(-1);

  return (
    <section
      className="mt-8 border border-slate-200 bg-white p-6 sm:p-8"
      aria-labelledby="img-history-title"
    >
      <p className="eyebrow">IMG representation</p>
      <h2 id="img-history-title" className="mt-2 text-2xl">
        International medical graduate data
      </h2>

      {!latest ? (
        <div className="mt-6 border border-slate-200 bg-slate-50 p-5">
          <p className="font-bold text-slate-900">
            No verified program-level IMG percentage is available yet.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {missingDataMessage(researchStatus)}
          </p>
          {researchStatus?.status === "not_reported" && (
            <a
              href={researchStatus.source_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-bold text-brand-700 underline underline-offset-2"
            >
              View the FREIDA program page ↗
            </a>
          )}
        </div>
      ) : (
        <>
          <p className="mt-4 max-w-4xl leading-7 text-slate-600">
            This describes representation among residents, not the probability
            that an IMG applicant will be accepted. Applicant volume and
            program-specific IMG acceptance counts are generally not published.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <CompositionDonut metric={latest} />
            <HistoryBars
              metrics={residentShare.length ? residentShare : [latest]}
            />
          </div>
          <div className="mt-6 border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-slate-700">
            <p className="font-bold text-slate-950">How to interpret this</p>
            <p className="mt-1">{latest.methodology_note}</p>
            <p className="mt-2">
              Source: {" "}
              <a
                href={latest.source_url}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-brand-700 underline underline-offset-2"
              >
                {latest.source_name} ↗
              </a>
              {latest.source_updated_at
                ? ` · source updated ${formatDate(latest.source_updated_at)}`
                : ""}
              {` · checked ${formatDate(latest.date_checked)}`}
            </p>
          </div>
        </>
      )}
    </section>
  );
}

function CompositionDonut({ metric }: { metric: ResidencyImgMetric }) {
  const percentage = Number(metric.img_percentage);
  const degrees = percentage * 3.6;

  return (
    <figure className="border border-slate-200 bg-slate-50 p-5 text-center">
      <figcaption className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Latest reported composition
      </figcaption>
      <div
        className="relative mx-auto mt-5 grid h-44 w-44 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#2563eb 0deg ${degrees}deg, #e2e8f0 ${degrees}deg 360deg)`,
        }}
        role="img"
        aria-label={`${percentage}% international medical graduates and ${100 - percentage}% other medical school graduates`}
      >
        <div className="grid h-28 w-28 place-items-center rounded-full bg-white">
          <span className="text-3xl font-black text-slate-950">
            {formatPercentage(percentage)}
          </span>
        </div>
      </div>
      <p className="mt-4 font-bold text-slate-900">{metricLabel(metric)}</p>
      <p className="mt-1 text-sm text-slate-500">{periodLabel(metric)}</p>
    </figure>
  );
}

function HistoryBars({ metrics }: { metrics: ResidencyImgMetric[] }) {
  return (
    <figure className="border border-slate-200 bg-white p-5">
      <figcaption className="font-bold text-slate-950">
        Reported IMG representation over time
      </figcaption>
      <div className="mt-6 space-y-5">
        {metrics.map((metric) => {
          const percentage = Number(metric.img_percentage);
          return (
            <div key={metric.id}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-slate-700">
                  {periodLabel(metric)}
                </span>
                <span className="font-black text-slate-950">
                  {formatPercentage(percentage)}
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${percentage}%` }}
                  role="img"
                  aria-label={`${periodLabel(metric)}: ${percentage}%`}
                />
              </div>
            </div>
          );
        })}
      </div>
      {metrics.length === 1 && (
        <p className="mt-5 text-sm leading-6 text-slate-500">
          One reporting period is currently available. Additional verified
          periods will appear here as they are imported.
        </p>
      )}
    </figure>
  );
}

function formatPercentage(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function missingDataMessage(status: ResidencyImgResearchStatus | null) {
  if (status?.status === "not_reported") {
    return `FREIDA was checked on ${formatDate(status.date_checked)}, but the program did not report an IMG resident percentage. This does not mean the program does not accept IMGs.`;
  }
  if (status?.status === "not_found") {
    return `A current public FREIDA page could not be matched when checked on ${formatDate(status.date_checked)}. This does not mean the program does not accept IMGs.`;
  }
  if (status?.status === "error") {
    return "The source check could not be completed. No percentage is shown until the source can be verified.";
  }
  return "This does not mean the program does not accept IMGs. It means a source-backed percentage has not been added for this program.";
}
