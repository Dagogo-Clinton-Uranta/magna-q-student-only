"use client";

import { useState } from "react";
import Link from "next/link";
import { appConfig } from "@/config/app";
import { BrandMark } from "@/components/brand/brand-mark";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-field/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandMark />
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 lg:flex"
        >
          {appConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-normal uppercase tracking-[0.12em] text-muted transition hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Link href="/login" className="button-secondary text-sm">
            Student login
          </Link>
          <Link href="/login?mode=signup" className="button-primary text-sm">
            Get started
          </Link>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
          className="grid min-h-11 min-w-11 place-items-center border border-line bg-white text-ink sm:hidden"
        >
          <span className="sr-only">Toggle navigation</span>
          <span aria-hidden="true" className="text-xl">
            {open ? "×" : "☰"}
          </span>
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-line bg-field px-4 py-4 shadow-card sm:hidden"
        >
          <div className="flex flex-col gap-1">
            {appConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="min-h-11 px-3 py-3 text-sm uppercase tracking-[0.08em] hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login?mode=signup" className="button-primary mt-2">
              Get started
            </Link>
            <Link href="/login" className="button-ghost">
              Student login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
