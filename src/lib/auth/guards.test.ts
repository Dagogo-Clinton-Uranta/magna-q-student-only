import { describe, expect, it } from "vitest";
import { profileHome } from "./guards";

describe("profileHome", () => {
  it("maps students to the dashboard", () => {
    expect(profileHome("student")).toBe("/dashboard");
  });
});
