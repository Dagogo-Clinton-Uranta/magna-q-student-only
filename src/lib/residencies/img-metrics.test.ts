import { describe, expect, it } from "vitest";
import {
  metricLabel,
  periodLabel,
  type ResidencyImgMetric,
} from "./img-metrics";

const metric: ResidencyImgMetric = {
  id: 1,
  reporting_year: 2026,
  period_kind: "three_year_average",
  metric_type: "img_resident_share",
  img_percentage: 34.5,
  img_count: null,
  total_count: null,
  source_name: "AMA FREIDA",
  source_url: "https://freida.ama-assn.org/program/example",
  source_updated_at: "2026-07-21",
  date_checked: "2026-09-03",
  methodology_note: "Three-year resident composition average.",
};

describe("residency IMG metric labels", () => {
  it("does not label resident composition as an acceptance rate", () => {
    expect(metricLabel(metric)).toBe("IMG share of current residents");
  });

  it("makes rolling reporting periods explicit", () => {
    expect(periodLabel(metric)).toBe("2026 three-year average");
  });

  it("labels actual acceptance metrics distinctly", () => {
    expect(
      metricLabel({ ...metric, metric_type: "img_acceptance_rate" }),
    ).toBe("IMG applicant acceptance rate");
  });
});
