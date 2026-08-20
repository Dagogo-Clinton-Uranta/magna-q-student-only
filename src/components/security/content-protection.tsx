"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { shouldProtectContent } from "@/config/content-protection";

const SCREENSHOT_KEYS = new Set(["3", "4", "5"]);

export function ContentProtection({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const protectedRoute = shouldProtectContent(pathname);
  const [shielded, setShielded] = useState(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("content-protected", protectedRoute);
    if (!protectedRoute) {
      setShielded(false);
      return () => root.classList.remove("content-protected");
    }

    const clearLater = (delay = 350) => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => setShielded(false), delay);
    };
    const showShield = () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
      setShielded(true);
    };
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") showShield();
      else clearLater();
    };
    const handleFocus = () => clearLater();
    const handleAfterPrint = () => clearLater();
    const handleKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const printScreen = key === "printscreen";
      const macCapture =
        event.metaKey && event.shiftKey && SCREENSHOT_KEYS.has(event.key);
      const browserCapture = event.ctrlKey && event.shiftKey && key === "s";
      if (!printScreen && !macCapture && !browserCapture) return;

      event.preventDefault();
      event.stopPropagation();
      showShield();
      clearLater(1_800);
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
          aria-hidden={!shielded}
        >
          <div className="border border-brand-200 bg-soft p-8 text-center shadow-lift">
            <p className="eyebrow">Protected learning space</p>
            <p className="mt-3 text-xl text-ink">
              Screen capture is disabled on this page.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
