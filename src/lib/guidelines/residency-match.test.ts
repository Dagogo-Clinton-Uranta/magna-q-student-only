import { describe, expect, it } from "vitest";
import {
  getResidencyTimelinePosition,
  residencyMatchMilestones,
} from "./residency-match";

describe("2027 residency Match timeline", () => {
  it("contains the official chronological endpoints and detailed actions", () => {
    expect(residencyMatchMilestones).toHaveLength(9);
    expect(residencyMatchMilestones[0]?.date).toBe("2026-05-01");
    expect(residencyMatchMilestones.at(-1)?.date).toBe("2027-03-19");
    expect(
      residencyMatchMilestones.every(
        (milestone) =>
          milestone.time.length > 0 && milestone.actions.length >= 3,
      ),
    ).toBe(true);
  });

  it("moves today's marker proportionally between adjacent milestones", () => {
    const milestones = [
      { date: "2027-01-01" },
      { date: "2027-01-11" },
      { date: "2027-01-21" },
    ];

    expect(getResidencyTimelinePosition(milestones, "2027-01-06")).toBe(25);
    expect(getResidencyTimelinePosition(milestones, "2027-01-16")).toBe(75);
  });

  it("always keeps today's marker on the planner", () => {
    const milestones = [{ date: "2027-01-01" }, { date: "2027-01-11" }];

    expect(getResidencyTimelinePosition(milestones, "2026-08-01")).toBe(0);
    expect(getResidencyTimelinePosition(milestones, "2028-08-01")).toBe(100);
  });
});
