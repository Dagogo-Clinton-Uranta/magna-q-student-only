import React from "react";
import Link from "next/link";
import { getPageWindow } from "@/lib/pagination";

export function Pagination({
  currentPage,
  totalPages,
  getPageHref,
  ariaLabel,
}: {
  currentPage: number;
  totalPages: number;
  getPageHref: (page: number) => string;
  ariaLabel: string;
}) {
  if (totalPages <= 1) return null;
  const window = getPageWindow(currentPage, totalPages);

  return (
    <nav
      className="mt-8 flex max-w-full items-center justify-center gap-2"
      aria-label={ariaLabel}
    >
      {window.previousWindowPage ? (
        <Link
          href={getPageHref(window.previousWindowPage)}
          aria-label={`Show pages ${Math.max(1, window.start - 10)} to ${window.start - 1}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-line bg-white text-xl font-semibold text-body"
        >
          ‹
        </Link>
      ) : (
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-line bg-white text-xl font-semibold text-body opacity-30"
          aria-hidden="true"
        >
          ‹
        </span>
      )}

      <div className="grid min-w-0 grid-cols-5 gap-1 sm:grid-cols-10">
        {window.pages.map((page) => (
          <Link
            key={page}
            href={getPageHref(page)}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Page ${page}`}
            className={`flex h-10 min-w-9 items-center justify-center border px-2 text-sm font-semibold ${
              page === currentPage
                ? "border-black bg-black text-white"
                : "border-line bg-white text-body"
            }`}
          >
            {page}
          </Link>
        ))}
      </div>

      {window.nextWindowPage ? (
        <Link
          href={getPageHref(window.nextWindowPage)}
          aria-label={`Show pages ${window.end + 1} to ${Math.min(totalPages, window.end + 10)}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-line bg-white text-xl font-semibold text-body"
        >
          ›
        </Link>
      ) : (
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-line bg-white text-xl font-semibold text-body opacity-30"
          aria-hidden="true"
        >
          ›
        </span>
      )}
    </nav>
  );
}
