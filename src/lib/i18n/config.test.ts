import { describe, expect, it } from "vitest";
import {
  localeFromAcceptLanguage,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from "./config";
import { MESSAGE_PACKS } from "./messages";

describe("internationalization configuration", () => {
  it("ships a complete pack for every supported locale", () => {
    const englishKeys = Object.keys(MESSAGE_PACKS.en).sort();
    expect(SUPPORTED_LOCALES).toEqual(["en", "es", "pt", "fr", "hi", "bn"]);
    for (const locale of SUPPORTED_LOCALES) {
      expect(Object.keys(MESSAGE_PACKS[locale]).sort()).toEqual(englishKeys);
    }
  });

  it("normalizes regional tags and rejects unsupported languages", () => {
    expect(normalizeLocale("pt-BR")).toBe("pt");
    expect(normalizeLocale("BN_bd")).toBe("bn");
    expect(normalizeLocale("de-DE")).toBe("en");
  });

  it("chooses the first supported browser language", () => {
    expect(localeFromAcceptLanguage("de-DE,de;q=0.9,fr-FR;q=0.8")).toBe("fr");
    expect(localeFromAcceptLanguage("es-MX,es;q=0.9,en;q=0.8")).toBe("es");
  });
});
