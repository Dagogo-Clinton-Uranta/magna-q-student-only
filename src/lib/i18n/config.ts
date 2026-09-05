export const SUPPORTED_LOCALES = ["en", "es", "pt", "fr", "hi", "bn"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_COOKIE_NAME = "magna-q-locale";

export const LOCALE_OPTIONS: ReadonlyArray<{
  code: AppLocale;
  nativeName: string;
}> = [
  { code: "en", nativeName: "English" },
  { code: "es", nativeName: "Español" },
  { code: "pt", nativeName: "Português" },
  { code: "fr", nativeName: "Français" },
  { code: "hi", nativeName: "हिन्दी" },
  { code: "bn", nativeName: "বাংলা" },
];

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export function normalizeLocale(value: unknown): AppLocale {
  if (typeof value !== "string") return DEFAULT_LOCALE;
  const base = value.trim().toLowerCase().split(/[-_]/)[0];
  return isAppLocale(base) ? base : DEFAULT_LOCALE;
}

export function localeFromAcceptLanguage(value: string | null): AppLocale {
  if (!value) return DEFAULT_LOCALE;
  for (const candidate of value.split(",")) {
    const tag = candidate.split(";")[0]?.trim();
    if (!tag) continue;
    const locale = normalizeLocale(tag);
    if (locale !== DEFAULT_LOCALE || tag.toLowerCase().startsWith("en")) {
      return locale;
    }
  }
  return DEFAULT_LOCALE;
}
