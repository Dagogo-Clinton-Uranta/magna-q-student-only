import "server-only";

import { getServerEnv } from "@/lib/env";
import type { AppLocale } from "@/lib/i18n/config";

export type AutomaticTranslationItem = { id: string; text: string };

type LibreTranslateResponse = {
  translatedText?: string | string[];
};

const MAX_CACHE_ENTRIES = 10_000;
const translationCache = new Map<string, string>();

function cacheKey(locale: AppLocale, text: string) {
  return `${locale}\u0000${text}`;
}

function remember(key: string, value: string) {
  if (translationCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = translationCache.keys().next().value;
    if (oldestKey) translationCache.delete(oldestKey);
  }
  translationCache.set(key, value);
}

/**
 * Translates a batch with locally hosted Argos models through LibreTranslate.
 * The service detects source languages independently, which lets reviewed UI
 * strings and English literals safely share a batch.
 */
export async function translateAutomatically(
  locale: AppLocale,
  items: AutomaticTranslationItem[],
) {
  const translated = new Map<string, string>();
  const missing: AutomaticTranslationItem[] = [];

  for (const item of items) {
    const cached = translationCache.get(cacheKey(locale, item.text));
    if (cached === undefined) missing.push(item);
    else translated.set(item.id, cached);
  }

  if (missing.length) {
    const env = getServerEnv();
    const response = await fetch(
      `${env.LIBRETRANSLATE_URL.replace(/\/$/, "")}/translate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: missing.map((item) => item.text),
          source: "auto",
          target: locale,
          format: "text",
          alternatives: 0,
          ...(env.LIBRETRANSLATE_API_KEY
            ? { api_key: env.LIBRETRANSLATE_API_KEY }
            : {}),
        }),
        signal: AbortSignal.timeout(45_000),
      },
    );

    if (!response.ok)
      throw new Error(`TRANSLATION_PROVIDER_${response.status}`);
    const payload = (await response.json()) as LibreTranslateResponse;
    const outputs = Array.isArray(payload.translatedText)
      ? payload.translatedText
      : typeof payload.translatedText === "string"
        ? [payload.translatedText]
        : [];
    if (outputs.length !== missing.length)
      throw new Error("TRANSLATION_INVALID_RESPONSE");

    for (const [index, source] of missing.entries()) {
      const output = outputs[index];
      if (typeof output !== "string")
        throw new Error("TRANSLATION_INVALID_RESPONSE");
      translated.set(source.id, output);
      remember(cacheKey(locale, source.text), output);
    }
  }

  return items.map((item) => ({
    id: item.id,
    text: translated.get(item.id) ?? item.text,
  }));
}
