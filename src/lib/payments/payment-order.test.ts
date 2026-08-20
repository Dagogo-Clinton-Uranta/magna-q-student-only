import { describe, expect, it } from "vitest";
import {
  currentInvoicePaymentOutcome,
  failedInvoiceShouldRevokeEntitlement,
  shouldApplyPaymentEvent,
} from "./payment-order";

describe("currentInvoicePaymentOutcome", () => {
  it("lets current Stripe state override a delayed failure snapshot", () => {
    expect(currentInvoicePaymentOutcome("paid")).toBe("paid");
  });

  it.each(["open", "void", "uncollectible", null])(
    "does not grant access for current invoice status %s",
    (status) => {
      expect(currentInvoicePaymentOutcome(status)).toBe("failed");
    },
  );
});

describe("failedInvoiceShouldRevokeEntitlement", () => {
  it("does not let an old failed invoice revoke a newer active period", () => {
    expect(
      failedInvoiceShouldRevokeEntitlement({
        invoiceId: "in_old",
        latestInvoiceId: "in_current",
        subscriptionStatus: "active",
      }),
    ).toBe(false);
  });

  it("revokes for the current failed invoice or a non-active subscription", () => {
    expect(
      failedInvoiceShouldRevokeEntitlement({
        invoiceId: "in_current",
        latestInvoiceId: "in_current",
        subscriptionStatus: "active",
      }),
    ).toBe(true);
    expect(
      failedInvoiceShouldRevokeEntitlement({
        invoiceId: "in_old",
        latestInvoiceId: "in_current",
        subscriptionStatus: "past_due",
      }),
    ).toBe(true);
  });
});

describe("shouldApplyPaymentEvent", () => {
  it("never downgrades a paid invoice when an older failure arrives", () => {
    expect(
      shouldApplyPaymentEvent(
        { status: "paid", stripeEventCreated: 200 },
        "failed",
        100,
      ),
    ).toBe(false);
  });

  it("also protects paid invoices from a later duplicate failure", () => {
    expect(
      shouldApplyPaymentEvent(
        { status: "paid", stripeEventCreated: 100 },
        "failed",
        200,
      ),
    ).toBe(false);
  });

  it("allows successful payment to upgrade an earlier failure", () => {
    expect(
      shouldApplyPaymentEvent(
        { status: "failed", stripeEventCreated: 200 },
        "paid",
        100,
      ),
    ).toBe(true);
  });

  it("ignores an older event when status has equal precedence", () => {
    expect(
      shouldApplyPaymentEvent(
        { status: "failed", stripeEventCreated: 200 },
        "failed",
        100,
      ),
    ).toBe(false);
  });
});
