"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

const TURNSTILE_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      appearance: "always";
      responseField: boolean;
      responseFieldName: string;
      size: "flexible";
      theme: "light";
    },
  ) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function TurnstileWidget({
  siteKey,
  action,
}: {
  siteKey: string;
  action: "login" | "signup";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current)
      return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      appearance: "always",
      responseField: true,
      responseFieldName: "cf-turnstile-response",
      size: "flexible",
      theme: "light",
    });
  }, [action, siteKey]);

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  return (
    <div className="sm:col-span-2">
      <Script
        src={TURNSTILE_SCRIPT}
        strategy="afterInteractive"
        onReady={renderWidget}
      />
      <div ref={containerRef} className="min-h-[65px] w-full" />
      <p className="mt-2 text-xs text-muted">
        Complete the human verification before continuing.
      </p>
    </div>
  );
}
