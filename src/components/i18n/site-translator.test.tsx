import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "./i18n-provider";
import { SiteTranslator } from "./site-translator";

describe("SiteTranslator", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    delete document.documentElement.dataset.translationState;
  });

  it("translates page copy, controls, accessibility text, and later content", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        texts: Array<{ id: string; text: string }>;
      };
      return {
        ok: true,
        json: async () => ({
          translations: body.texts.map((item) => ({
            id: item.id,
            text: `FR:${item.text}`,
          })),
        }),
      } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <I18nProvider initialLocale="fr">
        <main>
          <h1>Resources</h1>
          <button title="Open resource" aria-label="Open resource">
            View guideline
          </button>
          <input placeholder="Search resources" />
          <p data-no-translate>Magna-Q</p>
        </main>
        <SiteTranslator />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(container.querySelector("h1")?.textContent).toBe("FR:Resources");
      expect(container.querySelector("button")?.textContent?.trim()).toBe(
        "FR:View guideline",
      );
      expect(container.querySelector("button")?.title).toBe("FR:Open resource");
      expect(
        container.querySelector("button")?.getAttribute("aria-label"),
      ).toBe("FR:Open resource");
      expect(container.querySelector("input")?.placeholder).toBe(
        "FR:Search resources",
      );
    });
    expect(container.querySelector("[data-no-translate]")?.textContent).toBe(
      "Magna-Q",
    );

    const lateContent = document.createElement("p");
    lateContent.textContent = "New search result";
    container.querySelector("main")?.append(lateContent);

    await waitFor(() => {
      expect(lateContent.textContent).toBe("FR:New search result");
      expect(document.documentElement.dataset.translationState).toBe(
        "complete",
      );
    });
  });

  it("does not call the provider for the English source locale", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <I18nProvider initialLocale="en">
        <button>View resources</button>
        <SiteTranslator />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.dataset.translationState).toBe(
        "complete",
      );
    });
    expect(container.querySelector("button")?.textContent).toBe(
      "View resources",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
