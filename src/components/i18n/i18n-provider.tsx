"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { AppLocale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { translate, type MessageKey } from "@/lib/i18n/messages";

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: MessageKey) => string;
};

const defaultValue: I18nContextValue = {
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
  t: (key) => translate(DEFAULT_LOCALE, key),
};

const I18nContext = createContext<I18nContextValue>(defaultValue);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: AppLocale;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: (key) => translate(locale, key) }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
