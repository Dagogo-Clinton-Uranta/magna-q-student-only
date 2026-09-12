"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { updateSidebarTourCompleted } from "@/app/settings/actions";
import { useI18n } from "@/components/i18n/i18n-provider";
import type { MessageKey } from "@/lib/i18n/messages";
import {
  SIDEBAR_TOUR_COMPLETE_EVENT,
  SIDEBAR_TOUR_START_EVENT,
  sidebarTourStorageKey,
} from "@/lib/onboarding/sidebar-tour";

type TourItem = {
  href: string;
  title: string;
};

type MeasuredRect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

const tourDescriptionKeys: Readonly<Record<string, MessageKey>> = {
  "/dashboard": "tour.overview",
  "/get-featured": "tour.getFeatured",
  "/create-test": "tour.practiceTests",
  "/interview-practice": "tour.interviewPractice",
  "/resources": "tour.resources",
  "/guidelines": "tour.guidelines",
  "/blogs": "tour.communityBlogs",
  "/chat-rooms": "tour.chatRooms",
  "/feedback": "tour.feedback",
  "/profile": "tour.profile",
  "/settings": "tour.settings",
};

const HIGHLIGHT_GAP = 5;
const TOOLTIP_GAP = 18;

export function SidebarTour({
  items,
  userId,
  initialCompleted,
}: {
  items: readonly TourItem[];
  userId: string;
  initialCompleted: boolean;
}) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<MeasuredRect | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [tooltipSize, setTooltipSize] = useState({ width: 360, height: 240 });
  const [, startSavingTransition] = useTransition();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setOpen(true);
  }, []);

  const finishTour = useCallback(() => {
    setOpen(false);
    window.localStorage.setItem(sidebarTourStorageKey(userId), "true");
    window.dispatchEvent(new Event(SIDEBAR_TOUR_COMPLETE_EVENT));
    startSavingTransition(async () => {
      await updateSidebarTourCompleted(true);
    });
  }, [userId]);

  useEffect(() => {
    setMounted(true);
    const handleStart = () => startTour();
    window.addEventListener(SIDEBAR_TOUR_START_EVENT, handleStart);

    const completedLocally =
      window.localStorage.getItem(sidebarTourStorageKey(userId)) === "true";
    const timer =
      !initialCompleted && !completedLocally
        ? window.setTimeout(startTour, 450)
        : undefined;

    return () => {
      window.removeEventListener(SIDEBAR_TOUR_START_EVENT, handleStart);
      if (timer) window.clearTimeout(timer);
    };
  }, [initialCompleted, startTour, userId]);

  const findVisibleTarget = useCallback(() => {
    const href = items[stepIndex]?.href;
    if (!href) return null;
    return Array.from(
      document.querySelectorAll<HTMLElement>("[data-sidebar-tour-id]"),
    ).find(
      (element) =>
        element.dataset.sidebarTourId === href &&
        element.getClientRects().length > 0,
    );
  }, [items, stepIndex]);

  const measureTarget = useCallback(() => {
    const target = findVisibleTarget();
    setViewport({ width: window.innerWidth, height: window.innerHeight });
    if (!target) {
      setTargetRect(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [findVisibleTarget]);

  useLayoutEffect(() => {
    if (!open) return;
    const target = findVisibleTarget();
    target?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    measureTarget();
    const settleTimer = window.setTimeout(measureTarget, 350);
    const observer = target ? new ResizeObserver(measureTarget) : null;
    if (target) observer?.observe(target);
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      window.clearTimeout(settleTimer);
      observer?.disconnect();
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [findVisibleTarget, measureTarget, open, stepIndex]);

  useLayoutEffect(() => {
    if (!open || !tooltipRef.current) return;
    const tooltip = tooltipRef.current;
    const updateSize = () =>
      setTooltipSize({
        width: tooltip.offsetWidth,
        height: tooltip.offsetHeight,
      });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(tooltip);
    return () => observer.disconnect();
  }, [open, stepIndex]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nextButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        finishTour();
        return;
      }
      if (event.key === "Tab" && tooltipRef.current) {
        const controls = Array.from(
          tooltipRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!tooltipRef.current.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (event.key === "ArrowRight") {
        setStepIndex((current) => Math.min(current + 1, items.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setStepIndex((current) => Math.max(current - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [finishTour, items.length, open]);

  if (!mounted || !open || !items[stepIndex]) return null;

  const isLastStep = stepIndex === items.length - 1;
  const descriptionKey =
    tourDescriptionKeys[items[stepIndex].href] ?? "tour.overview";
  const tooltipWidth = Math.min(360, Math.max(280, viewport.width - 24));
  const isDesktop = viewport.width >= 1024;
  const tooltipLeft = targetRect
    ? isDesktop
      ? clamp(
          targetRect.right + TOOLTIP_GAP,
          12,
          viewport.width - tooltipWidth - 12,
        )
      : clamp(
          targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
          12,
          viewport.width - tooltipWidth - 12,
        )
    : Math.max(12, (viewport.width - tooltipWidth) / 2);
  const tooltipTop = targetRect
    ? isDesktop
      ? clamp(
          targetRect.top + targetRect.height / 2 - tooltipSize.height / 2,
          12,
          viewport.height - tooltipSize.height - 12,
        )
      : clamp(
          targetRect.top - tooltipSize.height - TOOLTIP_GAP,
          12,
          viewport.height - tooltipSize.height - 12,
        )
    : Math.max(12, (viewport.height - tooltipSize.height) / 2);

  return createPortal(
    <div data-no-translate>
      <TourOverlay rect={targetRect} />
      {targetRect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[61] border-2 border-white shadow-[0_0_0_2px_rgb(0_0_0/0.55)] transition-all duration-300 ease-out"
          style={{
            top: targetRect.top - HIGHLIGHT_GAP,
            left: targetRect.left - HIGHLIGHT_GAP,
            width: targetRect.width + HIGHLIGHT_GAP * 2,
            height: targetRect.height + HIGHLIGHT_GAP * 2,
          }}
        />
      )}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-tour-title"
        aria-describedby="sidebar-tour-description"
        className="fixed z-[70] border border-black bg-white p-5 text-black shadow-2xl transition-[top,left] duration-300 ease-out sm:p-6"
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipWidth,
        }}
      >
        {targetRect && (
          <span
            aria-hidden="true"
            className={`absolute h-4 w-4 rotate-45 border-black bg-white ${
              isDesktop
                ? "-left-2 border-b border-l"
                : "-bottom-2 border-b border-r"
            }`}
            style={
              isDesktop
                ? {
                    top: clamp(
                      targetRect.top + targetRect.height / 2 - tooltipTop - 8,
                      18,
                      tooltipSize.height - 34,
                    ),
                  }
                : {
                    left: clamp(
                      targetRect.left + targetRect.width / 2 - tooltipLeft - 8,
                      22,
                      tooltipWidth - 38,
                    ),
                  }
            }
          />
        )}
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-700">
            {t("tour.label")} {stepIndex + 1}/{items.length}
          </p>
          <button
            type="button"
            onClick={finishTour}
            className="text-xs font-semibold text-slate-600 underline underline-offset-4 hover:text-black"
          >
            {t("tour.skip")}
          </button>
        </div>
        <h2 id="sidebar-tour-title" className="mt-3 text-xl font-semibold">
          {items[stepIndex].title}
        </h2>
        <p
          id="sidebar-tour-description"
          className="mt-3 text-sm leading-6 text-slate-700"
        >
          {t(descriptionKey)}
        </p>
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
            className="button-secondary min-h-10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("tour.back")}
          </button>
          <button
            ref={nextButtonRef}
            type="button"
            onClick={() =>
              isLastStep ? finishTour() : setStepIndex((current) => current + 1)
            }
            className="button-primary min-h-10"
          >
            {isLastStep ? t("tour.finish") : t("tour.next")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function TourOverlay({ rect }: { rect: MeasuredRect | null }) {
  if (!rect) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/80" aria-hidden="true" />
    );
  }

  const top = Math.max(0, rect.top - HIGHLIGHT_GAP);
  const left = Math.max(0, rect.left - HIGHLIGHT_GAP);
  const right = rect.right + HIGHLIGHT_GAP;
  const bottom = rect.bottom + HIGHLIGHT_GAP;
  const sharedClass =
    "fixed z-[60] bg-black/80 transition-all duration-300 ease-out";

  return (
    <div aria-hidden="true">
      <div
        className={sharedClass}
        style={{ inset: `0 0 auto 0`, height: top }}
      />
      <div
        className={sharedClass}
        style={{ top, left: 0, width: left, height: bottom - top }}
      />
      <div
        className={sharedClass}
        style={{ top, left: right, right: 0, height: bottom - top }}
      />
      <div
        className={sharedClass}
        style={{ top: bottom, right: 0, bottom: 0, left: 0 }}
      />
    </div>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}
