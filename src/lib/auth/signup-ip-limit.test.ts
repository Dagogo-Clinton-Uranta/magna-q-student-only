import { describe, expect, it } from "vitest";
import {
  clientIpFromHeaders,
  normalizeClientIp,
} from "./signup-ip";

describe("signup IP restriction", () => {
  it("normalizes IPv4, IPv4-mapped IPv6, and equivalent IPv6 forms", () => {
    expect(normalizeClientIp("203.0.113.9")).toBe("203.0.113.9");
    expect(normalizeClientIp("::ffff:203.0.113.9")).toBe("203.0.113.9");
    expect(normalizeClientIp("2001:0db8:0:0:0:0:0:1")).toBe("2001:db8::1");
    expect(normalizeClientIp("not-an-ip")).toBeNull();
  });

  it("uses only the selected deployment provider's client-IP header", () => {
    const headers = new Headers({
      "cf-connecting-ip": "203.0.113.20",
      "x-forwarded-for": "198.51.100.10, 10.0.0.1",
    });
    expect(clientIpFromHeaders(headers, "cloudflare")).toBe("203.0.113.20");
  });

  it("uses the first valid forwarded address and rejects missing addresses", () => {
    expect(
      clientIpFromHeaders(
        new Headers({ "x-forwarded-for": "invalid, 198.51.100.11, 10.0.0.1" }),
      ),
    ).toBe("198.51.100.11");
    expect(clientIpFromHeaders(new Headers())).toBeNull();
  });
});
