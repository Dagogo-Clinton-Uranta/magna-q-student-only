import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  afterEach(cleanup);

  it("renders only the current ten-page group with group carets", () => {
    render(
      <Pagination
        currentPage={14}
        totalPages={32}
        ariaLabel="Results pages"
        getPageHref={(page) => `/results?page=${page}`}
      />,
    );

    expect(screen.getAllByLabelText(/^Page \d+$/)).toHaveLength(10);
    expect(screen.queryByLabelText("Page 10")).toBeNull();
    expect(screen.getByLabelText("Page 11")).toBeTruthy();
    expect(screen.getByLabelText("Page 20")).toBeTruthy();
    expect(
      screen.getByLabelText("Show pages 1 to 10").getAttribute("href"),
    ).toBe("/results?page=10");
    expect(
      screen.getByLabelText("Show pages 21 to 30").getAttribute("href"),
    ).toBe("/results?page=21");
  });
});
