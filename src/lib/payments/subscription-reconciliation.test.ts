import { describe, expect, it } from "vitest";
import { canBindSubscriptionThroughCustomer } from "./subscription-reconciliation";

describe("canBindSubscriptionThroughCustomer", () => {
  it("rejects an old subscription event for a current active binding", () => {
    expect(
      canBindSubscriptionThroughCustomer({
        incomingSubscriptionId: "sub_old",
        storedSubscriptionId: "sub_current",
      }),
    ).toBe(false);
  });

  it("allows the first subscription to bind to an existing customer", () => {
    expect(
      canBindSubscriptionThroughCustomer({
        incomingSubscriptionId: "sub_first",
        storedSubscriptionId: null,
      }),
    ).toBe(true);
  });

  it("does not replace even a terminal binding through customer ID alone", () => {
    expect(
      canBindSubscriptionThroughCustomer({
        incomingSubscriptionId: "sub_new",
        storedSubscriptionId: "sub_terminal",
      }),
    ).toBe(false);
  });

  it("allows the exact subscription already bound to the customer", () => {
    expect(
      canBindSubscriptionThroughCustomer({
        incomingSubscriptionId: "sub_current",
        storedSubscriptionId: "sub_current",
      }),
    ).toBe(true);
  });
});
