import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SHOW_TEST_TOUR_STORAGE_KEY } from "@/lib/study/player-preferences";
import { PlayerUtilities } from "./player-utilities";

describe("PlayerUtilities tour preference", () => {
  afterEach(cleanup);
  beforeEach(() => window.localStorage.clear());

  it("does not show the tour by default", () => {
    render(<PlayerUtilities />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the tour at test start when the setting is enabled", () => {
    window.localStorage.setItem(SHOW_TEST_TOUR_STORAGE_KEY, "true");
    render(<PlayerUtilities />);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Question player tour")).toBeTruthy();
  });
});
