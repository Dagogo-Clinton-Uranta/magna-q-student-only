import React from "react";
import Link from "next/link";
import { OnDemandTranslation } from "@/components/i18n/on-demand-translation";
import type {
  GuidelineArticle as GuidelineArticleData,
  GuidelineSection,
} from "@/lib/guidelines/articles";

export function GuidelineArticle({
  article,
  backHref = "/guidelines/residency-match",
  backLabel = "Back to guidelines",
  documentUrl,
  documentFileName,
}: {
  article: GuidelineArticleData;
  backHref?: string;
  backLabel?: string;
  documentUrl?: string | null;
  documentFileName?: string | null;
}) {
  const publishedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(new Date(article.published_at));

  return (
    <OnDemandTranslation contentLabel="article">
      <article className="mx-auto mt-5 max-w-5xl border border-brand-200 bg-white p-5 sm:p-8">
        <p className="eyebrow">{article.eyebrow}</p>
        <div className="mt-3 flex items-start justify-between gap-3 sm:gap-6">
          <h1 className="min-w-0 flex-1 text-2xl font-normal tracking-[0.02em] text-ink sm:text-3xl">
            {article.title}
          </h1>
          {documentUrl && (
            <a
              href={documentUrl}
              download={documentFileName ?? true}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-brand-300 bg-soft px-3 py-2 text-xs font-bold text-brand-800 transition hover:border-brand-600 hover:bg-brand-50 sm:text-sm"
              aria-label={`Download the full PDF for ${article.title}`}
            >
              <DownloadIcon />
              <span className="max-w-24 leading-4 sm:max-w-none">
                Download the full PDF
              </span>
            </a>
          )}
        </div>
        <p className="mt-3 text-sm text-muted">
          Reviewed {article.reviewed_at} · Published {publishedDate}
        </p>

        <div className="mt-5 max-w-4xl space-y-4 leading-7 text-muted">
          {article.preamble.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <nav
          aria-label="On this page"
          className="mt-8 border border-line bg-soft p-5 sm:p-6"
        >
          <h2 className="text-lg font-bold text-ink">On this page</h2>
          <ol className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {article.sections.map((section) => (
              <li key={section.number}>
                <a
                  href={`#section-${section.number}`}
                  className="font-semibold text-brand-800 underline-offset-2 hover:underline"
                >
                  {section.number}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="mt-8 space-y-6">
          {article.sections.map((section) => (
            <GuidelineSectionCard
              key={section.number}
              section={section}
              media={
                article.s3_media?.filter(
                  (asset) => asset.sectionNumber === section.number,
                ) ?? []
              }
            />
          ))}
        </ol>

        <section className="mt-10 border border-brand-300 bg-soft p-5 sm:p-6">
          <p className="eyebrow">Final takeaway</p>
          <div className="mt-3 max-w-4xl space-y-4 leading-7 text-body">
            {article.conclusion.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        {article.source_links.length > 0 && (
          <aside className="mt-8 border border-line bg-field p-5 sm:p-6">
            <h2 className="text-lg font-bold text-ink">
              Sources and further reading
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Dates, policies and program requirements can change. Recheck the
              current official guidance before submitting your application.
            </p>
            <ul className="mt-4 space-y-3">
              {article.source_links.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-brand-800 underline underline-offset-2"
                  >
                    {source.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <Link
          href={backHref}
          className="mt-8 inline-flex min-h-11 items-center font-bold text-brand-800"
        >
          ← {backLabel}
        </Link>
      </article>
    </OnDemandTranslation>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function GuidelineSectionCard({
  section,
  media,
}: {
  section: GuidelineSection;
  media: GuidelineArticleData["s3_media"] extends (infer Asset)[] | null
    ? Asset[]
    : never;
}) {
  return (
    <li
      id={`section-${section.number}`}
      className="scroll-mt-24 border border-line bg-field p-5 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center bg-black text-sm font-bold text-white">
          {section.number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-ink">{section.title}</h2>
          {section.introduction && (
            <p className="mt-3 text-sm leading-6 text-body">
              {section.introduction}
            </p>
          )}
          <ul className="mt-3 space-y-2 text-sm leading-6 text-body">
            {section.bullets.map((point) => {
              const isStory =
                /^(Story example|Real-world story|Worked story|Micro-story|Identity example) —/.test(
                  point,
                );
              return (
                <li
                  key={point}
                  className={
                    isStory
                      ? "mt-4 border-l-4 border-brand-500 bg-soft p-4 text-body"
                      : "flex gap-2"
                  }
                >
                  {!isStory && (
                    <span aria-hidden="true" className="text-brand-700">
                      •
                    </span>
                  )}
                  <span>{point}</span>
                </li>
              );
            })}
          </ul>
          {section.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {section.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-brand-800 underline underline-offset-2"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
          {media.map((asset) => (
            <figure key={asset.s3Url} className="mt-5">
              {asset.type === "video" ? (
                <video
                  controls
                  preload="metadata"
                  className="w-full border border-line bg-black"
                  aria-label={asset.altText}
                >
                  <source src={asset.s3Url} />
                </video>
              ) : (
                // S3 hosts are administrator-configured at runtime, so a native
                // image avoids coupling guideline media to Next's host allowlist.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.s3Url}
                  alt={asset.altText}
                  loading="lazy"
                  className="h-auto w-full border border-line"
                />
              )}
              {asset.caption && (
                <figcaption className="mt-2 text-xs leading-5 text-muted">
                  {asset.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </li>
  );
}
