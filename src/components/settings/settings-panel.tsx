"use client";

import React, { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "magna-q-theme";

export function SettingsPanel() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  function setDarkModePreference(enabled: boolean) {
    document.documentElement.classList.toggle("dark", enabled);
    window.localStorage.setItem(THEME_STORAGE_KEY, enabled ? "dark" : "light");
    setDarkMode(enabled);
  }

  return (
    <section
      className="mt-8 max-w-3xl border border-line bg-surface"
      aria-labelledby="preferences-title"
    >
      <div className="border-b border-line p-6 sm:p-8">
        <p className="eyebrow">Preferences</p>
        <h2 id="preferences-title" className="mt-2 text-2xl">
          App settings
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Choose how Magna-Q looks and how you would like to hear from us.
        </p>
      </div>

      <div className="divide-y divide-line">
        <SettingRow
          title="Dark mode"
          description="Use a darker colour palette across the entire site."
          checked={darkMode}
          onCheckedChange={setDarkModePreference}
        />
        <SettingRow
          title="Turn on email notifications"
          description="Receive useful account and study updates by email."
          checked={emailNotifications}
          onCheckedChange={setEmailNotifications}
        />
      </div>

      {emailNotifications && (
        <div
          role="status"
          className="m-6 border border-emerald-400 bg-emerald-100 p-4 text-sm text-emerald-950 sm:mx-8 sm:mb-8"
        >
          Email notifications are coming in the next patch.
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
