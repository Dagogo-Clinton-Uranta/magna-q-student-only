"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export function NotificationBellClient({
  items,
  unreadCount,
}: {
  items: NotificationItem[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function dismiss(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", dismiss);
    return () => document.removeEventListener("mousedown", dismiss);
  }, []);

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-10 w-10 place-items-center border border-line bg-white text-ink hover:bg-soft"
        aria-label={`${unreadCount} unread notifications`}
        aria-expanded={open}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-current"
          strokeWidth="1.8"
        >
          <path
            d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] border border-line bg-white shadow-xl">
          <div className="border-b border-line px-4 py-3 text-xs font-bold uppercase tracking-wider">
            Notifications
          </div>
          {items.length === 0 ? (
            <p className="p-4 text-sm text-muted">You have no notifications.</p>
          ) : (
            <div>
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/notifications/${item.id}`}
                  className={`block border-b border-line px-4 py-3 last:border-0 hover:bg-soft ${item.read ? "bg-white" : "bg-red-50/50"}`}
                >
                  <span className="block text-sm font-bold text-ink">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted">
                    {item.body}
                  </span>
                  <time className="mt-1 block text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </time>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
