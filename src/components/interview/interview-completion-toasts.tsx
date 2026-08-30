"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CompletionNotification = {
  id: string;
  title: string;
  body: string;
  href: string;
  completedAt: string;
};

const SEEN_KEY = "magna-q-seen-interview-completions";

export function InterviewCompletionToasts() {
  const [queue, setQueue] = useState<CompletionNotification[]>([]);
  const since = useRef(
    new Date(Date.now() - 24 * 60 * 60 * 1_000).toISOString(),
  );
  const active = queue[0];

  useEffect(() => {
    let cancelled = false;

    async function checkForCompletedInterviews() {
      try {
        const response = await fetch(
          `/api/interview/completion-notifications?since=${encodeURIComponent(since.current)}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as {
          notifications?: CompletionNotification[];
        };
        const notifications = payload.notifications ?? [];
        since.current = new Date().toISOString();
        if (cancelled || notifications.length === 0) return;
        const seen = new Set<string>(
          JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[],
        );
        const unseen = notifications.filter((item) => !seen.has(item.id));
        if (unseen.length === 0) return;
        unseen.forEach((item) => seen.add(item.id));
        localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-50)));
        setQueue((current) => [
          ...current,
          ...unseen.filter(
            (item) => !current.some((queued) => queued.id === item.id),
          ),
        ]);
      } catch {
        // Completion polling is optional UI enhancement; results remain saved.
      }
    }

    void checkForCompletedInterviews();
    const interval = window.setInterval(checkForCompletedInterviews, 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const timeout = window.setTimeout(
      () => setQueue((current) => current.slice(1)),
      10_000,
    );
    return () => window.clearTimeout(timeout);
  }, [active]);

  if (!active) return null;
  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[70] w-[min(24rem,calc(100vw-2.5rem))] border border-emerald-300 bg-white p-4 shadow-2xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-emerald-900">{active.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{active.body}</p>
        </div>
        <button
          type="button"
          onClick={() => setQueue((current) => current.slice(1))}
          className="text-xl leading-none text-slate-500"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
      <Link href={active.href} className="button-primary mt-3 inline-flex">
        View latest results
      </Link>
    </aside>
  );
}
