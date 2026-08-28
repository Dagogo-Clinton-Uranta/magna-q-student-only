import { describe, expect, it } from "vitest";
import type { StudentStage } from "@/lib/stages";
import { getStudentNavigationItems } from "./sidebar-nav";

describe("student navigation", () => {
  it.each<StudentStage>(["step1", "step2ck", "step3", "residency_interviews"])(
    "shows interview practice at the %s stage",
    (stage) => {
      expect(getStudentNavigationItems(stage)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            label: "Interview practice",
            href: "/interview-practice",
          }),
        ]),
      );
    },
  );
});
