import { beforeEach, describe, expect, it } from "vitest";
import {
  highlightStorageKey,
  normalizeHighlights,
  readQuestionHighlights,
  writeQuestionHighlights,
} from "./question-highlights";

describe("question highlights", () => {
  beforeEach(() => window.localStorage.clear());

  it("sorts, bounds, and merges overlapping ranges", () => {
    expect(
      normalizeHighlights(
        [
          { start: 8, end: 20 },
          { start: 2, end: 6 },
          { start: 5, end: 10 },
          { start: -1, end: 3 },
        ],
        12,
      ),
    ).toEqual([{ start: 2, end: 12 }]);
  });

  it("persists ranges per question and removes empty entries", () => {
    writeQuestionHighlights("question-1", [{ start: 1, end: 4 }]);

    expect(readQuestionHighlights("question-1", 10)).toEqual([
      { start: 1, end: 4 },
    ]);
    expect(readQuestionHighlights("question-2", 10)).toEqual([]);

    writeQuestionHighlights("question-1", []);
    expect(window.localStorage.getItem(highlightStorageKey("question-1"))).toBe(
      null,
    );
  });
});
