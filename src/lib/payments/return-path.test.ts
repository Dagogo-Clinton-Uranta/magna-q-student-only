import { describe, expect, it } from "vitest";
import { sanitizeReturnPath } from "./return-path";

describe("sanitizeReturnPath", () => {
  it("keeps local application destinations", () => {
    expect(sanitizeReturnPath("/create-test?exam=step2ck")).toBe(
      "/create-test?exam=step2ck",
    );
  });

  it.each([
    "https://attacker.example/path",
    "//attacker.example/path",
    "/\\attacker.example/path",
    "javascript:alert(1)",
  ])("rejects an unsafe destination: %s", (value) => {
    expect(sanitizeReturnPath(value)).toBe("/dashboard");
  });

  it("fails closed for repeated or non-string query parameters", () => {
    expect(sanitizeReturnPath(["/create-test", "//attacker.example"])).toBe(
      "/dashboard",
    );
    expect(sanitizeReturnPath({ path: "/create-test" })).toBe("/dashboard");
  });
});
