"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const THEME_STORAGE_KEY = "magna-q-theme";

function isThemeExcluded(pathname: string) {
  return pathname === "/login" || pathname === "/onboarding";
}

/** Keeps authentication and registration screens light during client routing. */
export function ThemeRouteController() {
  const pathname = usePathname();

  useEffect(() => {
    const darkModeEnabled =
      window.localStorage.getItem(THEME_STORAGE_KEY) === "dark";
    document.documentElement.classList.toggle(
      "dark",
      darkModeEnabled && !isThemeExcluded(pathname),
    );
  }, [pathname]);

  return null;
}
