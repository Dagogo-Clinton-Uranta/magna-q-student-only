export const RESIDENCY_IMG_METRIC_COLUMNS = [
  "id",
  "reporting_year",
  "period_kind",
  "metric_type",
  "img_percentage",
  "img_count",
  "total_count",
  "source_name",
  "source_url",
  "source_updated_at",
  "date_checked",
  "methodology_note",
].join(",");

export const RESIDENCY_IMG_RESEARCH_STATUS_COLUMNS = [
  "status",
  "source_url",
  "date_checked",
].join(",");

export type ResidencyImgMetric = {
  id: number;
  reporting_year: number;
  period_kind: "annual" | "three_year_average";
  metric_type:
    | "img_resident_share"
    | "img_matched_share"
    | "img_acceptance_rate";
  img_percentage: number;
  img_count: number | null;
  total_count: number | null;
  source_name: string;
  source_url: string;
  source_updated_at: string | null;
  date_checked: string;
  methodology_note: string;
};

export type ResidencyImgResearchStatus = {
  status: "available" | "not_reported" | "not_found" | "error";
  source_url: string;
  date_checked: string;
};

export function metricLabel(metric: ResidencyImgMetric) {
  if (metric.metric_type === "img_acceptance_rate") {
    return "IMG applicant acceptance rate";
  }
  if (metric.metric_type === "img_matched_share") {
    return "IMG share of matched residents";
  }
  return "IMG share of current residents";
}

export function periodLabel(metric: ResidencyImgMetric) {
  return metric.period_kind === "three_year_average"
    ? `${metric.reporting_year} three-year average`
    : String(metric.reporting_year);
}
