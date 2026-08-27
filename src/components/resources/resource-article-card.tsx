import Link from "next/link";
import type { ResourceSummary } from "@/lib/resources/articles";

export function ResourceArticleCard({
  article,
  href,
  expanded = false,
}: {
  article: ResourceSummary;
  href: string;
  expanded?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-lg ${
        expanded ? "min-h-[30rem]" : "min-h-72"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-black text-blue-800">
          R
        </span>
        <span className="text-sm font-bold text-blue-800 group-hover:underline">
          Open resource →
        </span>
      </div>
      <p className="mt-5 text-sm font-bold uppercase tracking-widest text-slate-500">
        Resource article
      </p>
      <h2 className="mt-2 text-xl font-black text-slate-950">
        {article.title}
      </h2>
      <p className="mt-3 leading-7 text-slate-600">{article.summary}</p>
      {expanded && (
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          {article.summary_points.map((point) => (
            <li key={point} className="flex gap-2">
              <span aria-hidden="true" className="text-blue-700">
                •
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
      <span className="mt-auto pt-5 font-bold text-blue-800 group-hover:underline">
        Read the full resource →
      </span>
    </Link>
  );
}
