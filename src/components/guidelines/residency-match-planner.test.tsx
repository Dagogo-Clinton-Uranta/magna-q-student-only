import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { residencyMatchMilestones } from "@/lib/guidelines/residency-match";
import { ResidencyMatchPlanner } from "./residency-match-planner";

afterEach(cleanup);

describe("ResidencyMatchPlanner", () => {
  it("renders a horizontal milestone control and a date-aware today marker", () => {
    render(
      <ResidencyMatchPlanner
        items={residencyMatchMilestones}
        today="2026-08-21"
      />,
    );

    expect(screen.getByText("You are here").textContent).toBe("You are here");
    expect(screen.getByTestId("today-marker").getAttribute("style")).toContain(
      "left:",
    );
    expect(
      screen.getAllByRole("button", { name: /^Open details for/ }),
    ).toHaveLength(9);
    expect(screen.getByLabelText("Scrollable Match timeline")).not.toBeNull();
  });

  it("opens the milestone guide on hover", () => {
    render(
      <ResidencyMatchPlanner
        items={residencyMatchMilestones}
        today="2027-02-10"
      />,
    );

    fireEvent.mouseEnter(
      screen.getByRole("button", {
        name: "Open details for Rank list certification deadline",
      }),
    );

    const guide = screen.getByRole("dialog");
    expect(guide.textContent).toContain("What to do");
    expect(guide.textContent).toContain("certify the list");
    expect(guide.textContent).toContain("Why it matters");
  });

  it("pins details on click and dismisses them with Escape", () => {
    render(
      <ResidencyMatchPlanner
        items={residencyMatchMilestones}
        today="2027-03-15"
      />,
    );

    const timeline = screen.getByLabelText("Scrollable Match timeline");
    const milestone = screen.getByRole("button", {
      name: "Open details for Match status + SOAP begins",
    });

    fireEvent.mouseEnter(milestone);
    fireEvent.click(milestone);
    fireEvent.mouseLeave(timeline.firstElementChild as Element);
    expect(screen.queryByRole("dialog")).not.toBeNull();

    fireEvent.keyDown(
      screen.getByLabelText("2027 residency Match chronological planner"),
      { key: "Escape" },
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
