import { describe, expect, it } from "vitest";
import {
  parseStripeLiveMode,
  stripeModeMatches,
} from "@/lib/payments/stripe-mode";

describe("Stripe live/test mode", () => {
  it("requires an explicit boolean environment value", () => {
    expect(parseStripeLiveMode("true")).toBe(true);
    expect(parseStripeLiveMode("false")).toBe(false);
    expect(() => parseStripeLiveMode(undefined)).toThrow("STRIPE_LIVE_MODE");
    expect(() => parseStripeLiveMode("1")).toThrow("STRIPE_LIVE_MODE");
  });

  it("rejects provider objects from the other Stripe mode", () => {
    expect(stripeModeMatches(true, true)).toBe(true);
    expect(stripeModeMatches(false, false)).toBe(true);
    expect(stripeModeMatches(true, false)).toBe(false);
  });
});
