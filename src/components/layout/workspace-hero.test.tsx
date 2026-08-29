import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WorkspaceHero } from "./workspace-hero";

afterEach(cleanup);

describe("WorkspaceHero", () => {
  it.each([
    ["journey", "medinexus-journey-hero.png"],
    ["guidelines", "usmle-guidelines-hero.png"],
  ] as const)("renders the %s background artwork", (image, filename) => {
    const { container, getByRole } = render(
      <WorkspaceHero image={image}>
        <h2>Page introduction</h2>
      </WorkspaceHero>,
    );

    expect(getByRole("heading", { name: "Page introduction" })).toBeTruthy();
    expect(container.querySelector("img")?.getAttribute("src")).toContain(
      filename,
    );
  });
});
