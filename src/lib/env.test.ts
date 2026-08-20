import { afterEach, describe, expect, it } from "vitest";
import { getPublicEnv } from "./env";

const original = { ...process.env };
afterEach(() => {
  process.env = { ...original };
});

describe("environment validation", () => {
  it("accepts browser-safe configuration", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "a".repeat(20);
    expect(getPublicEnv().NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });
  it("fails with a readable message", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(() => getPublicEnv()).toThrow("Invalid environment configuration");
  });
});
