"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { LOCALE_OPTIONS } from "@/lib/i18n/config";

type TranslationResponse = {
  translations?: Array<{ id: string; text: string }>;
};

const MAX_BATCH_CHARACTERS = 600;
const BROWSER_CACHE_KEY = "magna-q.runtime-translations.v1";

function splitForTranslation(value: string) {
  if (value.length <= MAX_BATCH_CHARACTERS) return [value];
  const chunks: string[] = [];
  let offset = 0;
  while (offset < value.length) {
    let end = Math.min(offset + MAX_BATCH_CHARACTERS, value.length);
    if (end < value.length) {
      const whitespace = value.lastIndexOf(" ", end);
      if (whitespace > offset + Math.floor(MAX_BATCH_CHARACTERS / 2))
        end = whitespace + 1;
    }
    chunks.push(value.slice(offset, end));
    offset = end;
  }
  return chunks;
}

function withOriginalWhitespace(source: string, translated: string) {
  const start = source.search(/\S/);
  if (start < 0) return source;
  const end = source.search(/\s*$/);
  return `${source.slice(0, start)}${translated}${source.slice(end)}`;
}

function readCache() {
  try {
    const entries = JSON.parse(
      window.localStorage.getItem(BROWSER_CACHE_KEY) ?? "[]",
    ) as unknown;
    return new Map<string, string>(
      Array.isArray(entries)
        ? entries.filter(
            (entry): entry is [string, string] =>
              Array.isArray(entry) &&
              typeof entry[0] === "string" &&
              typeof entry[1] === "string",
          )
        : [],
    );
  } catch {
    return new Map<string, string>();
  }
}

function writeCache(cache: Map<string, string>) {
  try {
    window.localStorage.setItem(
      BROWSER_CACHE_KEY,
      JSON.stringify(Array.from(cache.entries()).slice(-1_500)),
    );
  } catch {
    // The translation itself still succeeds when storage is unavailable.
  }
}

export function OnDemandTranslation({
  children,
  contentLabel,
  contentKey,
}: {
  children: React.ReactNode;
  contentLabel: string;
  contentKey?: string;
}) {
  const { locale } = useI18n();
  const contentRef = useRef<HTMLDivElement>(null);
  const originals = useRef(new Map<Text, string>());
  const [status, setStatus] = useState<
    "idle" | "translating" | "translated" | "error"
  >("idle");

  useEffect(() => {
    for (const [node, source] of originals.current) {
      if (node.isConnected) node.data = source;
    }
    setStatus("idle");
  }, [contentKey, locale]);

  async function translate() {
    if (locale === "en" || status === "translating") return;
    const root = contentRef.current;
    if (!root) return;
    setStatus("translating");

    try {
      const targets = new Map<string, Text[]>();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const textNode = node as Text;
        const source = originals.current.get(textNode) ?? textNode.data;
        originals.current.set(textNode, source);
        const text = source.trim();
        if (/\p{L}/u.test(text)) {
          const group = targets.get(text) ?? [];
          group.push(textNode);
          targets.set(text, group);
        }
        node = walker.nextNode();
      }

      const cache = readCache();
      for (const [source, nodes] of targets) {
        const key = `${locale}\u0000${source}`;
        let translated = cache.get(key);
        if (translated === undefined) {
          const translatedParts: string[] = [];
          for (const part of splitForTranslation(source)) {
            const response = await fetch("/api/i18n/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                locale,
                texts: [{ id: "content", text: part }],
              }),
            });
            if (!response.ok)
              throw new Error(`Translation failed (${response.status})`);
            const result = (await response.json()) as TranslationResponse;
            const output = result.translations?.[0]?.text;
            if (typeof output !== "string")
              throw new Error("Translation returned an invalid response");
            translatedParts.push(output);
          }
          translated = translatedParts.join("");
          cache.set(key, translated);
          // Save successful pieces immediately: a long article can resume from
          // its completed paragraphs if a later provider request fails.
          writeCache(cache);
        }
        for (const textNode of nodes) {
          const original = originals.current.get(textNode) ?? source;
          textNode.data = withOriginalWhitespace(original, translated);
        }
      }
      writeCache(cache);
      setStatus("translated");
    } catch {
      setStatus("error");
    }
  }

  const language = LOCALE_OPTIONS.find((option) => option.code === locale);
  return (
    <>
      {locale !== "en" && (
        <div className="mx-auto mt-5 flex max-w-5xl items-center justify-between gap-4 border border-brand-200 bg-brand-50 p-4 text-sm text-brand-950">
          <p>
            {status === "translated"
              ? `This ${contentLabel} is shown in ${language?.nativeName ?? locale}.`
              : `Read this ${contentLabel} in ${language?.nativeName ?? locale}.`}
          </p>
          <button
            type="button"
            onClick={() => void translate()}
            disabled={status === "translating" || status === "translated"}
            className="button-primary min-h-11 shrink-0 px-4 text-sm disabled:cursor-wait disabled:opacity-70"
          >
            {status === "translating"
              ? "Translating…"
              : status === "translated"
                ? "Translated"
                : `Change to ${language?.nativeName ?? locale}`}
          </button>
          {status === "error" && (
            <p role="alert" className="text-xs text-red-800">
              Translation could not finish. Please try again.
            </p>
          )}
        </div>
      )}
      <div ref={contentRef} data-translate-on-demand>
        {children}
      </div>
    </>
  );
}
