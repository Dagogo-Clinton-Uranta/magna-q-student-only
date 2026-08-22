import { afterEach, describe, expect, it } from "vitest";
import { configuredRedisUrl, requireRedisUrl } from "./url";

const original = process.env.REDIS_URL;
afterEach(() => {
  if (original === undefined) delete process.env.REDIS_URL;
  else process.env.REDIS_URL = original;
});

describe("Redis URL validation", () => {
  it("accepts a TLS Redis URL", () => {
    process.env.REDIS_URL = "rediss://default:secret@example.upstash.io:6379";
    expect(configuredRedisUrl()).toBe(process.env.REDIS_URL);
  });

  it("rejects a duplicated environment assignment", () => {
    process.env.REDIS_URL =
      "REDIS_URL=rediss://default:secret@example.upstash.io:6379";
    expect(() => configuredRedisUrl()).toThrow("second REDIS_URL= prefix");
  });

  it("reports when Redis is required but missing", () => {
    delete process.env.REDIS_URL;
    expect(() => requireRedisUrl("chat")).toThrow(
      "REDIS_URL is required for chat",
    );
  });
});
