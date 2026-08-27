import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuidelineArticle } from "./guideline-article";

describe("GuidelineArticle", () => {
  it("renders walkthrough-style numbered cards and spaced bullet points", () => {
    render(
      <GuidelineArticle
        documentUrl="/assets/example-resource.pdf"
        documentFileName="example-resource.pdf"
        article={{
          id: "d60aed0c-6403-4bbb-a1f8-7166d066fbec",
          slug: "example-guideline",
          title: "Example guideline article",
          eyebrow: "Example",
          summary: "Example summary",
          summary_points: ["Summary one", "Summary two"],
          classification: "residency-and-matching",
          published_at: "2026-08-22T20:28:11.000Z",
          preamble: ["Opening context."],
          sections: [
            {
              number: 1,
              title: "Confirm the strategy",
              bullets: ["Check the program requirements.", "Confirm fit."],
              links: [],
            },
          ],
          conclusion: ["Use every signal deliberately."],
          s3_media: null,
          source_links: [],
          reviewed_at: "2026-08-22",
        }}
      />,
    );

    const section = screen
      .getByRole("heading", {
        name: "Confirm the strategy",
      })
      .closest("li");

    expect(section?.className).toContain("border");
    expect(section?.className).toContain("bg-field");
    expect(section?.className).toContain("p-5");
    expect(section?.querySelector("ul")?.className).toContain("space-y-2");
    expect(screen.getByText("1", { selector: "span" }).className).toContain(
      "bg-black",
    );
    expect(screen.getByText("1", { selector: "span" }).className).toContain(
      "text-white",
    );
    expect(screen.queryByRole("img")).toBeNull();
    const download = screen.getByRole("link", {
      name: "Download the full PDF for Example guideline article",
    });
    expect(download.getAttribute("href")).toBe("/assets/example-resource.pdf");
    expect(download.getAttribute("download")).toBe("example-resource.pdf");
    expect(download.parentElement?.className).toContain("justify-between");
  });
});
