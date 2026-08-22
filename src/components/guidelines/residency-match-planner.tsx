"use client";

import { useState, type KeyboardEvent } from "react";
import {
  getResidencyTimelinePosition,
  type ResidencyMatchMilestone,
} from "@/lib/guidelines/residency-match";

const phaseStyles: Record<ResidencyMatchMilestone["phase"], string> = {
  Prepare: "bg-amber-50 text-amber-800 ring-amber-200",
  Register: "bg-sky-50 text-sky-800 ring-sky-200",
  Rank: "bg-violet-50 text-violet-800 ring-violet-200",
  "Match Week": "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

function MilestoneIcon({ phase }: { phase: ResidencyMatchMilestone["phase"] }) {
  if (phase === "Prepare") {
    return (
      <path
        d="M4.5 19.5v-15h15v15h-15Zm4-11h7m-7 3.5h7m-7 3.5h4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    );
  }
  if (phase === "Register") {
    return (
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.7-4 3.1-6 7-6s6.3 2 7 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    );
  }
  if (phase === "Rank") {
    return (
      <path
        d="m5 7 2 2 3.5-4M5 15l2 2 3.5-4M13 8h6m-6 8h6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    );
  }
  return (
    <path
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-4-9.5 2.5 2.5 5.5-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  );
}

function formatToday(today: string) {
  const parsed = new Date(`${today}T12:00:00Z`);
  if (Number.isNaN(parsed.valueOf())) return today;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function ResidencyMatchPlanner({
  items,
  today,
}: {
  items: ResidencyMatchMilestone[];
  today: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const timelinePosition = getResidencyTimelinePosition(items, today);
  const trackStart = items.length > 0 ? 50 / items.length : 0;
  const trackWidth = items.length > 0 ? 100 - 100 / items.length : 100;
  const markerLeft = trackStart + (timelinePosition / 100) * trackWidth;
  const activeItem = activeIndex === null ? null : items[activeIndex];
  const firstDate = items.at(0)?.date ?? "";
  const lastDate = items.at(-1)?.date ?? "";
  const cycleStatus =
    today < firstDate
      ? "Cycle has not started"
      : today > lastDate
        ? "2027 cycle complete"
        : "Cycle in progress";

  function openMilestone(index: number) {
    if (!isPinned) setActiveIndex(index);
  }

  function selectMilestone(index: number) {
    if (isPinned && activeIndex === index) {
      setIsPinned(false);
      setActiveIndex(null);
      return;
    }
    setActiveIndex(index);
    setIsPinned(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      setIsPinned(false);
      setActiveIndex(null);
    }
  }

  if (items.length === 0) return null;

  return (
    <section
      aria-label="2027 residency Match chronological planner"
      className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-950 px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
            Official 2027 NRMP calendar
          </p>
          <p className="mt-1 text-sm text-slate-300">
            May 1, 2026 → March 19, 2027 · all published times are ET
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
              <path
                d="M12 17v.01M12 14a4 4 0 1 0-4-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </span>
          <span>Hover or focus a point. Click to keep its guide open.</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3 text-xs sm:px-7">
        <p className="font-semibold text-slate-700">
          {cycleStatus} · Today is {formatToday(today)}
        </p>
        <div className="hidden items-center gap-3 text-slate-500 md:flex">
          {(Object.keys(phaseStyles) as ResidencyMatchMilestone["phase"][]).map(
            (phase) => (
              <span key={phase} className="inline-flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${phaseStyles[phase].split(" ")[0]}`}
                />
                {phase}
              </span>
            ),
          )}
        </div>
      </div>

      <div className="overflow-x-auto" aria-label="Scrollable Match timeline">
        <div
          className="relative h-[35rem] min-w-[1180px] px-4 pt-7"
          onMouseLeave={() => {
            if (!isPinned) setActiveIndex(null);
          }}
        >
          <div
            aria-hidden
            className="absolute top-[7.6rem] h-1 rounded-full bg-slate-200"
            style={{ left: `${trackStart}%`, width: `${trackWidth}%` }}
          />
          <div
            aria-hidden
            className="absolute top-[7.6rem] h-1 rounded-full bg-brand-500 transition-[width] duration-500"
            style={{
              left: `${trackStart}%`,
              width: `${(timelinePosition / 100) * trackWidth}%`,
            }}
          />

          <div
            className="pointer-events-none absolute top-[5.35rem] z-20 -translate-x-1/2 text-center transition-[left] duration-500"
            style={{ left: `${markerLeft}%` }}
            data-testid="today-marker"
          >
            <span className="inline-flex whitespace-nowrap rounded-full bg-brand-700 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md">
              You are here
            </span>
            <span className="mx-auto block h-3 w-px bg-brand-700" />
            <span className="mx-auto block h-3 w-3 rounded-full border-[3px] border-white bg-brand-700 shadow ring-2 ring-brand-300" />
          </div>

          <ol
            className="relative z-10 grid"
            style={{
              gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
            }}
          >
            {items.map((item, index) => (
              <li key={item.date} className="min-w-0 text-center">
                <p className="h-12 px-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <span className="block text-sm text-slate-900">
                    {item.shortDate}
                  </span>
                  {item.time}
                </p>
                <button
                  type="button"
                  aria-expanded={activeIndex === index}
                  aria-controls={`match-milestone-${index}`}
                  aria-label={`Open details for ${item.stage}`}
                  onMouseEnter={() => openMilestone(index)}
                  onFocus={() => openMilestone(index)}
                  onBlur={() => {
                    if (!isPinned) setActiveIndex(null);
                  }}
                  onClick={() => selectMilestone(index)}
                  className={`mx-auto mt-3 flex h-11 w-11 items-center justify-center !rounded-full border-4 border-white shadow-md ring-2 transition duration-150 focus:outline-none focus:ring-4 focus:ring-brand-300 ${
                    activeIndex === index
                      ? "scale-110 bg-brand-700 text-white ring-brand-300"
                      : "bg-slate-900 text-white ring-slate-300 hover:scale-110 hover:bg-brand-700 hover:ring-brand-300"
                  }`}
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
                    <MilestoneIcon phase={item.phase} />
                  </svg>
                </button>
                <p className="mx-auto mt-3 max-w-[7.5rem] text-xs font-bold leading-4 text-slate-800">
                  {item.stage}
                </p>
              </li>
            ))}
          </ol>

          {activeItem ? (
            <div
              id={`match-milestone-${activeIndex}`}
              role="dialog"
              aria-modal="false"
              aria-labelledby={`match-milestone-title-${activeIndex}`}
              className="absolute top-[13.5rem] z-30 w-[40rem] max-w-[calc(100%-2rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl"
              style={{
                left: `${Math.min(72, Math.max(28, markerPanelPosition(activeIndex, items.length)))}%`,
              }}
            >
              <div className="grid grid-cols-[8rem_minmax(0,1fr)]">
                <div className="flex flex-col items-center justify-center bg-slate-950 p-5 text-center text-white">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
                    Step {String(activeIndex! + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                    <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7">
                      <MilestoneIcon phase={activeItem.phase} />
                    </svg>
                  </span>
                  <span
                    className={`mt-5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${phaseStyles[activeItem.phase]}`}
                  >
                    {activeItem.phase}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                        {activeItem.shortDate}, {activeItem.date.slice(0, 4)} ·{" "}
                        {activeItem.time}
                      </p>
                      <h3
                        id={`match-milestone-title-${activeIndex}`}
                        className="mt-1 text-lg font-black text-slate-950"
                      >
                        {activeItem.stage}
                      </h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Close milestone details"
                      onClick={() => {
                        setIsPinned(false);
                        setActiveIndex(null);
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center !rounded-full bg-slate-100 text-lg text-slate-600 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      ×
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {activeItem.summary}
                  </p>
                  <div className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs leading-5 text-brand-950">
                    <span className="font-black">Why it matters: </span>
                    {activeItem.whyItMatters}
                  </div>
                  <p className="mt-4 text-xs font-black uppercase tracking-wider text-slate-900">
                    What to do
                  </p>
                  <ul className="mt-2 grid gap-2 text-xs leading-5 text-slate-700">
                    {activeItem.actions.map((action) => (
                      <li key={action} className="flex gap-2">
                        <span
                          aria-hidden
                          className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700"
                        >
                          ✓
                        </span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute left-1/2 top-[16.5rem] w-[34rem] -translate-x-1/2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-7 text-center">
              <p className="text-sm font-bold text-slate-800">
                Explore each milestone
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Hover, tab to, or select any point to see its deadline, why it
                matters, and your action checklist.
              </p>
            </div>
          )}
        </div>
      </div>
      <p className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs leading-5 text-slate-500 sm:px-7">
        Planning aid based on the supplied 2027 Main Residency Match Calendar.
        R3 is authoritative for Match and SOAP status; confirm the official
        calendar before acting.
      </p>
    </section>
  );
}

function markerPanelPosition(index: number | null, itemCount: number) {
  if (index === null || itemCount < 2) return 50;
  return (index / (itemCount - 1)) * 100;
}
