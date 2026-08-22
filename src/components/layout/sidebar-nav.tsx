"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";

type IconName =
  | "home"
  | "test"
  | "video"
  | "book"
  | "guide"
  | "article"
  | "chat"
  | "feedback"
  | "profile";

type NavigationItem = { label: string; href: string; icon: IconName };

const studentItems: readonly NavigationItem[] = [
  { label: "Overview", href: "/dashboard", icon: "home" },
  { label: "Practice tests", href: "/create-test", icon: "test" },
  { label: "Interview practice", href: "/interview-practice", icon: "video" },
  { label: "Resources", href: "/resources", icon: "book" },
  { label: "Guidelines", href: "/guidelines", icon: "guide" },
  { label: "Community blogs", href: "/blogs", icon: "article" },
  { label: "Chat rooms", href: "/chat-rooms", icon: "chat" },
  { label: "Feedback", href: "/feedback", icon: "feedback" },
  { label: "Profile", href: "/profile", icon: "profile" },
] as const;

const warmedMenus = new Set<string>();

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const items = studentItems;
  const menuKey = "student";

  useEffect(() => {
    if (warmedMenus.has(menuKey)) return;
    warmedMenus.add(menuKey);

    // These pages are dynamic because they are authenticated. Next's default
    // automatic prefetch only warms their loading boundary, so fetch the full
    // destinations once the first workspace screen has become interactive.
    const warmRoutes = () => {
      items.forEach((item) => {
        if (item.href !== pathname) router.prefetch(item.href);
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(warmRoutes, { timeout: 1_500 });
    } else {
      setTimeout(warmRoutes, 200);
    }
  }, [items, menuKey, pathname, router]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 lg:block">
        <div className="px-2">
          <BrandMark href="/dashboard" />
        </div>
        <nav className="mt-8 space-y-1" aria-label="Main navigation">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 px-3 text-xs font-normal uppercase tracking-[0.08em] transition ${active ? "border-l-2 border-brand-600 bg-soft text-black" : "border-l-2 border-transparent text-muted hover:bg-field hover:text-black"}`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center ${active ? "text-brand-700" : "text-muted"}`}
                >
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-line bg-field/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgb(32_34_36/0.06)] backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[4.5rem] min-w-[4.6rem] flex-1 flex-col items-center justify-center gap-1 px-1 text-center text-[9px] font-normal uppercase tracking-[0.06em] ${active ? "text-brand-700" : "text-muted"}`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center ${active ? "bg-soft" : ""}`}
              >
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

/** Lightweight inline icons avoid a dependency and inherit state colours. */
function NavIcon({ name }: { name: IconName }) {
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9M9 20v-6h6v6" />
      </>
    ),
    test: (
      <>
        <path d="M7 3h10v4H7z" />
        <path d="M5 5H4v16h16V5h-1M8 12h8M8 16h5" />
      </>
    ),
    video: (
      <>
        <rect x="3" y="6" width="13" height="12" rx="2" />
        <path d="m16 10 5-3v10l-5-3" />
      </>
    ),
    book: (
      <>
        <path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4z" />
        <path d="M20 4h-4a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h4z" />
      </>
    ),
    guide: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15 9-2 4-4 2 2-4z" />
      </>
    ),
    article: (
      <>
        <path d="M5 3h10l4 4v14H5z" />
        <path d="M14 3v5h5M8 12h8M8 16h8" />
      </>
    ),
    chat: (
      <>
        <path d="M4 5h16v11H9l-5 4z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </>
    ),
    feedback: (
      <>
        <path d="M12 21a9 9 0 1 0-9-9" />
        <path d="M3 16v5h5M8 9h8M8 13h5" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
