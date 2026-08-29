import { describe, expect, it } from "vitest";
import { planResultRetention, type RetentionRecord } from "./retention";

function completed(
  id: number,
  userId = "u1",
  type: RetentionRecord["type"] = "mock",
): RetentionRecord {
  return {
    id: String(id),
    userId,
    type,
    status: "completed",
    completedAt: new Date(2026, 0, id).toISOString(),
  };
}

describe("five-result retention", () => {
  it.each([1, 5])("retains %s completed results without deletion", (count) => {
    const records = Array.from({ length: count }, (_, index) =>
      completed(index + 1),
    );
    expect(
      planResultRetention(records, { userId: "u1", type: "mock" }),
    ).toEqual({
      retainedIds: records.map((item) => item.id).reverse(),
      deletedIds: [],
    });
  });

  it("deletes the oldest when a sixth completed result is saved", () => {
    const result = planResultRetention(
      Array.from({ length: 6 }, (_, index) => completed(index + 1)),
      { userId: "u1", type: "mock" },
    );
    expect(result.retainedIds).toHaveLength(5);
    expect(result.deletedIds).toEqual(["1"]);
  });

  it("preserves in-progress sessions and another user's records", () => {
    const records: RetentionRecord[] = [
      ...Array.from({ length: 6 }, (_, index) => completed(index + 1)),
      {
        id: "active",
        userId: "u1",
        type: "mock",
        status: "in_progress",
        completedAt: null,
      },
      completed(1, "u2"),
    ];
    const result = planResultRetention(records, { userId: "u1", type: "mock" });
    expect(result.deletedIds).toEqual(["1"]);
    expect(result.deletedIds).not.toContain("active");
  });

  it("retains individual practice independently from mock interviews", () => {
    const records = [
      ...Array.from({ length: 6 }, (_, index) =>
        completed(index + 1, "u1", "mock"),
      ),
      ...Array.from({ length: 5 }, (_, index) =>
        completed(index + 10, "u1", "individual"),
      ),
    ];
    const result = planResultRetention(records, {
      userId: "u1",
      type: "individual",
    });
    expect(result.deletedIds).toEqual([]);
    expect(result.retainedIds).toHaveLength(5);
  });
});
