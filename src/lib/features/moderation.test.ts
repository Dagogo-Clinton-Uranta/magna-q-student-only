import { describe, expect, it } from "vitest";
import {
  mentionedUsernames,
  moderateFeatureComment,
} from "@/lib/features/moderation";

describe("feature comment moderation", () => {
  it("accepts constructive in-app feedback with mentions", () => {
    expect(
      moderateFeatureComment(
        "@dr_ada This would be useful for rural rotations.",
      ),
    ).toEqual({ accepted: true, reasons: [] });
  });

  it.each([
    "Email me at doctor@example.com",
    "Call me on +1 (555) 123-4567",
    "See https://example.com for details",
  ])("rejects off-platform contact information: %s", (content) => {
    expect(moderateFeatureComment(content).accepted).toBe(false);
  });

  it("extracts unique, normalized usernames", () => {
    expect(
      mentionedUsernames("@Dr_Ada thank you, and thank you again @dr_ada"),
    ).toEqual(["dr_ada"]);
  });
});
