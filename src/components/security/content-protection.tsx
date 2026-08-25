"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { shouldProtectContent } from "@/config/content-protection";

const SCREENSHOT_KEYS = new Set(["3", "4", "5"]);
const PRINT_SCREEN_KEYS = new Set(["printscreen", "snapshot"]);

export function ContentProtection({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const protectedRoute = shouldProtectContent(pathname);
  const [shielded, setShielded] = useState(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("content-protected", protectedRoute);
    if (!protectedRoute) {
      root.classList.remove("content-capture-active");
      setShielded(false);
      return () => {
        root.classList.remove("content-protected");
        root.classList.remove("content-capture-active");
      };
    }

    const clearLater = (delay = 350) => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => {
        root.classList.remove("content-capture-active");
        setShielded(false);
      }, delay);
    };
    const showShield = () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
      // Apply the document-level class synchronously. Waiting for React to
      // commit state can leave protected content visible for another frame.
      root.classList.add("content-capture-active");
      setShielded(true);
    };
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") showShield();
      else clearLater();
    };
    const handleFocus = () => clearLater();
    const handleAfterPrint = () => clearLater();
    const handleKey = (event: KeyboardEvent) => {
      const key = normalizeCaptureKey(event.key);
      const code = normalizeCaptureKey(event.code);
      const printScreen =
        PRINT_SCREEN_KEYS.has(key) || PRINT_SCREEN_KEYS.has(code);
      const captureDigit = code.startsWith("digit") ? code.slice(5) : key;
      const macCapture =
        event.metaKey && event.shiftKey && SCREENSHOT_KEYS.has(captureDigit);
      const windowsCapture =
        event.shiftKey &&
        (event.metaKey || event.getModifierState("OS")) &&
        key === "s";
      const browserCapture = event.ctrlKey && event.shiftKey && key === "s";
      const printCommand = (event.ctrlKey || event.metaKey) && key === "p";
      if (
        !printScreen &&
        !macCapture &&
        !windowsCapture &&
        !browserCapture &&
        !printCommand
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      showShield();
      clearLater(2_500);
    };

    window.addEventListener("blur", showShield);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("keydown", handleKey, true);
    window.addEventListener("keyup", handleKey, true);
    window.addEventListener("beforeprint", showShield);
    window.addEventListener("afterprint", handleAfterPrint);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      root.classList.remove("content-protected");
      root.classList.remove("content-capture-active");
      if (clearTimer.current) clearTimeout(clearTimer.current);
      window.removeEventListener("blur", showShield);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keydown", handleKey, true);
      window.removeEventListener("keyup", handleKey, true);
      window.removeEventListener("beforeprint", showShield);
      window.removeEventListener("afterprint", handleAfterPrint);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [protectedRoute]);

  return (
    <>
      <div
        className={`protected-content min-h-screen ${shielded && protectedRoute ? "protected-content--shielded" : ""}`}
        aria-hidden={shielded && protectedRoute ? true : undefined}
      >
        {children}
      </div>
      {protectedRoute && (
        <div
          className={`content-protection-overlay ${shielded ? "content-protection-overlay--visible" : ""}`}
          aria-hidden="true"
        />
      )}
    </>
  );
}

function normalizeCaptureKey(value: string) {
  return value.replaceAll(" ", "").toLowerCase();
}
