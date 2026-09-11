import { describe, expect, it } from "vitest";
import { getPageWindow } from "./pagination";

describe("getPageWindow", () => {
  it("returns at most ten pages in the current group", () => {
    expect(getPageWindow(14, 32)).toEqual({
      start: 11,
      end: 20,
      pages: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      previousWindowPage: 10,
      nextWindowPage: 21,
    });
  });

  it("bounds the first and final groups", () => {
    expect(getPageWindow(1, 4).pages).toEqual([1, 2, 3, 4]);
    expect(getPageWindow(31, 32)).toMatchObject({
      pages: [31, 32],
      previousWindowPage: 30,
      nextWindowPage: null,
    });
  });
});
