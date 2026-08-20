"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";

// Only public marketing/legal pages use a footer. Authenticated pages already
// have persistent sidebar navigation and should keep the workspace uncluttered.
const publicFooterRoutes = [
  /^\/$/,
  /^\/(privacy|terms|contact|medical-disclaimer)\/?$/,
];

export function ConditionalSiteFooter() {
  const pathname = usePathname();
  if (!publicFooterRoutes.some((route) => route.test(pathname))) return null;
  return <SiteFooter />;
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white text-body">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_.8fr_.8fr] lg:py-16">
        <div>
          <BrandMark />
          <p className="mt-5 max-w-md text-sm leading-6 text-muted">
            One connected path for licensing exams, residency preparation,
            interviews, and the Match.
          </p>
          <div className="mt-6 flex items-center gap-2" aria-hidden="true">
            <span className="h-px w-14 bg-line" />
            <span className="h-2 w-2 rotate-45 border border-line bg-white" />
            <span className="h-px w-14 bg-line" />
          </div>
        </div>
        <FooterLinks
          title="Explore"
          links={[
            ["Dashboard", "/dashboard"],
            ["Practice tests", "/create-test"],
            ["Interview practice", "/interview-practice"],
            ["Resources", "/resources"],
          ]}
        />
        <FooterLinks
          title="Trust & support"
          links={[
            ["Contact", "/contact"],
            ["Privacy", "/privacy"],
            ["Terms", "/terms"],
            ["Medical disclaimer", "/medical-disclaimer"],
          ]}
        />
      </div>
      <div className="border-t border-line bg-field">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Magna-Q.</p>
          <p>Educational content only — not medical advice.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs font-normal uppercase tracking-[0.18em] text-black">
        {title}
      </h2>
      <ul className="mt-5 space-y-3 text-sm text-muted">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link className="transition hover:text-brand-700" href={href}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
