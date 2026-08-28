import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkspaceHero } from "./workspace-hero";

describe("WorkspaceHero", () => {
  it.each([
    ["journey", "medinexus-journey-hero.png"],
    ["guidelines", "usmle-guidelines-hero.png"],
  ] as const)("renders the %s background artwork", (image, filename) => {
    const { container } = render(
      <WorkspaceHero image={image}>
        <h2>Page introduction</h2>
      </WorkspaceHero>,
    );

    expect(
      screen.getByRole("heading", { name: "Page introduction" }),
    ).toBeTruthy();
    expect(container.querySelector("img")?.getAttribute("src")).toContain(
      filename,
    );
  });
});
