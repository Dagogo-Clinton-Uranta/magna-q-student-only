import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockedEnv = vi.hoisted(() => ({
  LIBRETRANSLATE_URL: "http://127.0.0.1:5000",
  LIBRETRANSLATE_API_KEY: "local-test-key",
}));

vi.mock("@/lib/env", () => ({
  getServerEnv: () => mockedEnv,
}));

import { translateAutomatically } from "./automatic-translation";

describe("translateAutomatically", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("translates a batch through the self-hosted LibreTranslate endpoint", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        Response.json({ translatedText: ["Recursos", "Abrir guía"] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      translateAutomatically("es", [
        { id: "resource-title", text: "Resources provider test" },
        { id: "guide-button", text: "Open guide provider test" },
      ]),
    ).resolves.toEqual([
      { id: "resource-title", text: "Recursos" },
      { id: "guide-button", text: "Abrir guía" },
    ]);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://127.0.0.1:5000/translate",
    );
    const request = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as Record<string, unknown>;
    expect(request).toMatchObject({
      q: ["Resources provider test", "Open guide provider test"],
      source: "auto",
      target: "es",
      format: "text",
      api_key: "local-test-key",
    });
  });

  it("rejects incomplete batch responses instead of mixing languages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ translatedText: ["Ressources"] })),
    );

    await expect(
      translateAutomatically("fr", [
        { id: "first", text: "First incomplete provider test" },
        { id: "second", text: "Second incomplete provider test" },
      ]),
    ).rejects.toThrow("TRANSLATION_INVALID_RESPONSE");
  });
});
