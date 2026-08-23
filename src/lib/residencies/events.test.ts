import { describe, expect, it } from "vitest";
import {
  eventDirectoryHref,
  eventIdSchema,
  eventNotesSchema,
  formatEventTime,
  parseEventFilterOptions,
} from "./events";

describe("residency event directory helpers", () => {
  it("keeps all active filters in pagination links", () => {
    expect(
      eventDirectoryHref({
        page: 2,
        from: "2026-08-25",
        to: "2026-09-01",
        institution: "e888132a-47f9-4bf2-8da3-aeff4b6acfd8",
        format: "virtual",
        location: "PA|Philadelphia",
        sort: "latest",
      }),
    ).toContain(
      "from=2026-08-25&to=2026-09-01&institution=e888132a-47f9-4bf2-8da3-aeff4b6acfd8&format=virtual&location=PA%7CPhiladelphia&sort=latest&page=2",
    );
  });

  it("parses only valid searchable filter options", () => {
    expect(
      parseEventFilterOptions({
        institutions: [{ label: "Penn", value: "program-id" }, null],
        locations: [{ label: "Philadelphia, PA", value: "PA|Philadelphia" }],
      }),
    ).toMatchObject({
      institutions: [{ label: "Penn", value: "program-id" }],
      locations: [{ label: "Philadelphia, PA", value: "PA|Philadelphia" }],
    });
  });

  it("formats known and unknown event times", () => {
    expect(formatEventTime("18:00:00", "19:30:00", "ET")).toBe(
      "6:00 PM–7:30 PM ET",
    );
    expect(formatEventTime(null, null, "ET")).toBe("Time to be confirmed");
  });

  it("validates event IDs and private-note limits", () => {
    const eventId = "e888132a-47f9-4bf2-8da3-aeff4b6acfd8";
    expect(eventIdSchema.safeParse(eventId).success).toBe(true);
    expect(eventIdSchema.safeParse("not-an-event").success).toBe(false);
    expect(
      eventNotesSchema.safeParse({ eventId, notes: "Plan questions" }).success,
    ).toBe(true);
    expect(
      eventNotesSchema.safeParse({ eventId, notes: "x".repeat(10001) }).success,
    ).toBe(false);
  });
});
