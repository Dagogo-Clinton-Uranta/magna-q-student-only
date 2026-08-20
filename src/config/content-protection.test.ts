import { describe, expect, it } from "vitest";
import { shouldProtectContent } from "./content-protection";

describe("content protection routes", () => {
  it.each(["/", "/login", "/login/", "/verify", "/auth/callback"])(
    "allows captures on %s",
    (pathname) => expect(shouldProtectContent(pathname)).toBe(false),
  );

  it.each([
    "/dashboard",
    "/create-test",
    "/study/block/example",
    "/interview-practice",
    "/chat-rooms",
    "/privacy",
  ])("protects %s", (pathname) =>
    expect(shouldProtectContent(pathname)).toBe(true),
  );
});
