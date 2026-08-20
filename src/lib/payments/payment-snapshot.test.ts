import { describe, expect, it } from "vitest";
import { normalizePaymentIdentitySnapshot } from "@/lib/payments/payment-snapshot";

describe("normalizePaymentIdentitySnapshot", () => {
  it("falls back when Stripe supplies blank identity values", () => {
    expect(
      normalizePaymentIdentitySnapshot({
        providerName: "  ",
        providerEmail: "",
        trustedName: "Ada Student",
        trustedEmail: "ada@example.com",
      }),
    ).toEqual({ name: "Ada Student", email: "ada@example.com" });
  });

  it("bounds names and rejects an overlong provider email", () => {
    const result = normalizePaymentIdentitySnapshot({
      providerName: `  ${"N".repeat(250)}  `,
      providerEmail: `${"e".repeat(330)}@example.com`,
      trustedName: "Student",
      trustedEmail: "student@example.com",
    });
    expect(result.name).toHaveLength(200);
    expect(result.email).toBe("student@example.com");
  });

  it("falls back from a malformed provider email", () => {
    expect(
      normalizePaymentIdentitySnapshot({
        providerName: "Student",
        providerEmail: "not-an-email",
        trustedName: "Student",
        trustedEmail: "student@example.com",
      }).email,
    ).toBe("student@example.com");
  });
});
