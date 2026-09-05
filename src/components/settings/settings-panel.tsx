"use client";

import React, { useEffect, useState, useTransition } from "react";
import { updatePreferredLocale } from "@/app/settings/actions";
import { useI18n } from "@/components/i18n/i18n-provider";
import { LOCALE_OPTIONS, type AppLocale } from "@/lib/i18n/config";

const THEME_STORAGE_KEY = "magna-q-theme";

export function SettingsPanel({
  initialLocale = "en",
}: {
  initialLocale?: AppLocale;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(initialLocale);
  const [languageStatus, setLanguageStatus] = useState<
    "idle" | "saved" | "error"
  >("idle");
  const [isSavingLanguage, startLanguageTransition] = useTransition();
  const { setLocale, t } = useI18n();

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
    setLocale(initialLocale);
    document.documentElement.lang = initialLocale;
  }, [initialLocale, setLocale]);

  function setDarkModePreference(enabled: boolean) {
    document.documentElement.classList.toggle("dark", enabled);
    window.localStorage.setItem(THEME_STORAGE_KEY, enabled ? "dark" : "light");
    setDarkMode(enabled);
  }

  function setLanguagePreference(locale: AppLocale) {
    const previousLocale = selectedLocale;
    setSelectedLocale(locale);
    setLocale(locale);
    document.documentElement.lang = locale;
    setLanguageStatus("idle");
    startLanguageTransition(async () => {
      const result = await updatePreferredLocale(locale);
      if (!result.ok) {
        setSelectedLocale(previousLocale);
        setLocale(previousLocale);
        document.documentElement.lang = previousLocale;
        setLanguageStatus("error");
        return;
      }
      setLanguageStatus("saved");
    });
  }

  return (
    <section
      className="mt-8 max-w-3xl border border-line bg-surface"
      aria-labelledby="preferences-title"
    >
      <div className="border-b border-line p-6 sm:p-8">
        <p className="eyebrow">{t("settings.preferences")}</p>
        <h2 id="preferences-title" className="mt-2 text-2xl">
          {t("settings.appSettings")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {t("settings.intro")}
        </p>
      </div>

      <div className="divide-y divide-line">
        <SettingRow
          title={t("settings.darkMode")}
          description={t("settings.darkModeDescription")}
          checked={darkMode}
          onCheckedChange={setDarkModePreference}
        />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <label htmlFor="study-language" className="text-base text-ink">
                {t("settings.language")}
              </label>
              <p className="mt-1 text-sm leading-6 text-muted">
                {t("settings.languageDescription")}
              </p>
            </div>
            <select
              id="study-language"
              value={selectedLocale}
              disabled={isSavingLanguage}
              onChange={(event) =>
                setLanguagePreference(event.currentTarget.value as AppLocale)
              }
              className="min-h-11 min-w-48 border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:cursor-wait disabled:opacity-70"
            >
              {LOCALE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.nativeName}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">
            {t("settings.contentNotice")}
          </p>
          {(isSavingLanguage || languageStatus !== "idle") && (
            <p
              role="status"
              className={`mt-2 text-xs ${languageStatus === "error" ? "text-red-700" : "text-brand-700"}`}
            >
              {isSavingLanguage
                ? t("settings.saving")
                : languageStatus === "saved"
                  ? t("settings.saved")
                  : t("settings.saveError")}
            </p>
          )}
        </div>
        <SettingRow
          title={t("settings.emailNotifications")}
          description={t("settings.emailNotificationsDescription")}
          checked={emailNotifications}
          onCheckedChange={setEmailNotifications}
        />
      </div>

      {emailNotifications && (
        <div
          role="status"
          className="m-6 border border-emerald-400 bg-emerald-100 p-4 text-sm text-emerald-950 sm:mx-8 sm:mb-8"
        >
          {t("settings.emailComingSoon")}
        </div>
      )}
    </section>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 p-6 sm:p-8">
      <div>
        <h3 className="text-base text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      <label className="relative block h-7 w-12 shrink-0 cursor-pointer">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          aria-checked={checked}
          aria-label={title}
          onChange={(event) => onCheckedChange(event.currentTarget.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`settings-toggle absolute inset-0 border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
            checked ? "border-brand-600 bg-brand-600" : "border-line bg-field"
          }`}
        >
          <span
            className={`settings-toggle__thumb absolute top-1/2 h-5 w-5 -translate-y-1/2 bg-surface shadow-sm transition-transform ${
              checked ? "translate-x-[1.55rem]" : "translate-x-1"
            }`}
          />
        </span>
      </label>
    </div>
  );
}
