import { describe, expect, it, vi } from "vitest";
import {
  createPaidChatAccessChecker,
  projectionHasCurrentPaidChatAccess,
  type ChatBillingProjection,
} from "@/lib/chat/paid-access";

const now = Date.parse("2026-08-12T12:00:00.000Z");

function paidProjection(
  overrides: Partial<ChatBillingProjection> = {},
): ChatBillingProjection {
  return {
    role: "student",
    monthlyPayment: "paid",
    status: "active",
    currentPeriodStart: "2026-08-01T00:00:00.000Z",
    currentPeriodEnd: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("projectionHasCurrentPaidChatAccess", () => {
  it("accepts only a current active paid student projection", () => {
    expect(projectionHasCurrentPaidChatAccess(paidProjection(), now)).toBe(
      true,
    );
    expect(
      projectionHasCurrentPaidChatAccess(
        paidProjection({ monthlyPayment: "unpaid" }),
        now,
      ),
    ).toBe(false);
    expect(
      projectionHasCurrentPaidChatAccess(
        paidProjection({ status: "past_due" }),
        now,
      ),
    ).toBe(false);
    expect(
      projectionHasCurrentPaidChatAccess(
        paidProjection({ currentPeriodEnd: "2026-08-12T12:00:00.000Z" }),
        now,
      ),
    ).toBe(false);
  });
});

describe("createPaidChatAccessChecker", () => {
  it("deduplicates concurrent and short-lived repeated lookups", async () => {
    const loader = vi.fn(async () => paidProjection());
    let currentTime = now;
    const check = createPaidChatAccessChecker(
      loader,
      10_000,
      () => currentTime,
    );

    await expect(
      Promise.all([check("student-1"), check("student-1")]),
    ).resolves.toEqual([true, true]);
    currentTime += 9_999;
    await expect(check("student-1")).resolves.toBe(true);
    expect(loader).toHaveBeenCalledTimes(1);

    currentTime += 2;
    await expect(check("student-1")).resolves.toBe(true);
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("does not cache provider errors", async () => {
    const loader = vi
      .fn<() => Promise<ChatBillingProjection | null>>()
      .mockRejectedValueOnce(new Error("database unavailable"))
      .mockResolvedValueOnce(paidProjection());
    const check = createPaidChatAccessChecker(loader, 10_000, () => now);

    await expect(check("student-1")).rejects.toThrow("database unavailable");
    await expect(check("student-1")).resolves.toBe(true);
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
