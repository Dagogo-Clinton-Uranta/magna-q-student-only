"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/components/i18n/i18n-provider";
import type { AppLocale } from "@/lib/i18n/config";

type TranslationState = {
  source: string;
  output: string;
  locale: AppLocale;
};

type TextTarget = { kind: "text"; node: Text; source: string };
type AttributeTarget = {
  kind: "attribute";
  element: Element;
  attribute: string;
  source: string;
};
type TranslationTarget = TextTarget | AttributeTarget;

type TranslationResponse = {
  translations?: Array<{ id: string; text: string }>;
};

const TRANSLATED_ATTRIBUTES = [
  "aria-label",
  "aria-description",
  "placeholder",
  "title",
  "alt",
] as const;
const EXCLUDED_SELECTOR = [
  "[data-no-translate]",
  "[data-translate-on-demand]",
  "script",
  "style",
  "noscript",
  "code",
  "pre",
  "svg",
  "math",
  "textarea",
  '[contenteditable="true"]',
].join(",");
// Keep requests deliberately small for a modest self-hosted translation host.
// Each completed batch is applied immediately, so the page progressively
// translates instead of waiting for a large database-backed page to finish.
const MAX_BATCH_ITEMS = 4;
const MAX_BATCH_CHARACTERS = 600;
const FLUSH_DELAY_MS = 60;
const BROWSER_CACHE_KEY = "magna-q.runtime-translations.v1";
const MAX_BROWSER_CACHE_ENTRIES = 1_500;

function hasWords(value: string) {
  return /\p{L}/u.test(value);
}

function contentOf(value: string) {
  return value.trim();
}

function withOriginalWhitespace(source: string, translated: string) {
  const start = source.search(/\S/);
  if (start < 0) return source;
  const end = source.search(/\s*$/);
  return `${source.slice(0, start)}${translated}${source.slice(end)}`;
}

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

function excluded(element: Element | null) {
  return !element || Boolean(element.closest(EXCLUDED_SELECTOR));
}

/**
 * Complements the small, reviewed UI dictionary with runtime translation for
 * every visible text node and accessibility attribute. A MutationObserver
 * also covers client navigation, streamed server components, dialogs, toasts,
 * search results, and other content that appears after the first render.
 */
export function SiteTranslator() {
  const { locale } = useI18n();
  const textStates = useRef(new WeakMap<Text, TranslationState>());
  const attributeStates = useRef(
    new WeakMap<Element, Map<string, TranslationState>>(),
  );
  const cache = useRef(new Map<string, string>());

  useEffect(() => {
    let stopped = false;
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    let flushing = false;
    const controller = new AbortController();
    const pending = new Map<string, TranslationTarget[]>();
    let cacheWriteTimer: ReturnType<typeof setTimeout> | null = null;

    function persistCache() {
      cacheWriteTimer = null;
      try {
        const entries = Array.from(cache.current.entries()).slice(
          -MAX_BROWSER_CACHE_ENTRIES,
        );
        window.localStorage.setItem(BROWSER_CACHE_KEY, JSON.stringify(entries));
      } catch {
        // Translation remains functional when browser storage is unavailable.
      }
    }

    function rememberTranslation(key: string, value: string) {
      cache.current.delete(key);
      cache.current.set(key, value);
      if (cache.current.size > MAX_BROWSER_CACHE_ENTRIES)
        cache.current.delete(cache.current.keys().next().value!);
      if (!cacheWriteTimer) cacheWriteTimer = setTimeout(persistCache, 250);
    }

    try {
      const stored = JSON.parse(
        window.localStorage.getItem(BROWSER_CACHE_KEY) ?? "[]",
      ) as unknown;
      if (Array.isArray(stored)) {
        for (const entry of stored) {
          if (
            Array.isArray(entry) &&
            typeof entry[0] === "string" &&
            typeof entry[1] === "string"
          )
            cache.current.set(entry[0], entry[1]);
        }
      }
    } catch {
      // Ignore a malformed or unavailable local cache.
    }

    document.documentElement.lang = locale;
    document.documentElement.dataset.translationState = "loading";

    function addTarget(source: string, target: TranslationTarget) {
      const text = contentOf(source);
      if (!text || !hasWords(text)) return;

      // Application-authored source copy is English. Returning to English can
      // therefore restore the canonical source immediately without a network
      // round trip.
      if (locale === "en") {
        applyTarget(target, text);
        return;
      }

      const cached = cache.current.get(`${locale}\u0000${text}`);
      if (cached !== undefined) {
        applyTarget(target, cached);
        return;
      }

      const targets = pending.get(text) ?? [];
      targets.push(target);
      pending.set(text, targets);
      scheduleFlush();
    }

    function queueText(node: Text) {
      if (excluded(node.parentElement)) return;
      const current = node.data;
      const previous = textStates.current.get(node);
      if (
        previous &&
        current === previous.output &&
        previous.locale === locale
      ) {
        return;
      }
      const source =
        previous && current === previous.output ? previous.source : current;
      addTarget(source, { kind: "text", node, source });
    }

    function queueAttribute(element: Element, attribute: string) {
      if (excluded(element)) return;
      const current = element.getAttribute(attribute);
      if (!current) return;
      const states = attributeStates.current.get(element);
      const previous = states?.get(attribute);
      if (
        previous &&
        current === previous.output &&
        previous.locale === locale
      ) {
        return;
      }
      const source =
        previous && current === previous.output ? previous.source : current;
      addTarget(source, { kind: "attribute", element, attribute, source });
    }

    function queueElementAttributes(element: Element) {
      for (const attribute of TRANSLATED_ATTRIBUTES) {
        if (element.hasAttribute(attribute)) queueAttribute(element, attribute);
      }
      if (
        element instanceof HTMLInputElement &&
        ["button", "reset", "submit"].includes(element.type) &&
        element.hasAttribute("value")
      ) {
        queueAttribute(element, "value");
      }
    }

    function scan(root: Node) {
      if (root.nodeType === Node.TEXT_NODE) {
        queueText(root as Text);
        return;
      }
      if (!(root instanceof Element) && root !== document) return;
      if (root instanceof Element) queueElementAttributes(root);

      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      );
      let node = walker.nextNode();
      while (node) {
        if (node.nodeType === Node.TEXT_NODE) queueText(node as Text);
        else queueElementAttributes(node as Element);
        node = walker.nextNode();
      }
    }

    function scheduleFlush() {
      if (flushTimer || flushing || stopped) return;
      flushTimer = setTimeout(() => {
        flushTimer = null;
        void flush();
      }, FLUSH_DELAY_MS);
    }

    function applyTarget(target: TranslationTarget, translated: string) {
      const output = withOriginalWhitespace(target.source, translated);
      const state = { source: target.source, output, locale };
      if (target.kind === "text") {
        if (!target.node.isConnected) return;
        const previous = textStates.current.get(target.node);
        if (
          target.node.data !== target.source &&
          target.node.data !== previous?.output
        ) {
          return;
        }
        textStates.current.set(target.node, state);
        target.node.data = output;
        return;
      }

      if (!target.element.isConnected) return;
      const states =
        attributeStates.current.get(target.element) ??
        new Map<string, TranslationState>();
      const previous = states.get(target.attribute);
      const current = target.element.getAttribute(target.attribute);
      if (current !== target.source && current !== previous?.output) return;
      states.set(target.attribute, state);
      attributeStates.current.set(target.element, states);
      target.element.setAttribute(target.attribute, output);
    }

    async function flush() {
      if (flushing || stopped || !pending.size) return;
      flushing = true;
      document.documentElement.dataset.translationState = "loading";

      try {
        while (pending.size && !stopped) {
          const oversized = Array.from(pending.entries()).find(
            ([text]) => text.length > MAX_BATCH_CHARACTERS,
          );
          if (oversized) {
            const [source, targets] = oversized;
            pending.delete(source);
            const translatedParts: string[] = [];
            for (const part of splitForTranslation(source)) {
              const response = await fetch("/api/i18n/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  locale,
                  texts: [{ id: "part", text: part }],
                }),
                signal: controller.signal,
              });
              if (!response.ok)
                throw new Error(`Translation failed (${response.status})`);
              const result = (await response.json()) as TranslationResponse;
              const translation = result.translations?.find(
                (item) => item.id === "part",
              )?.text;
              if (typeof translation !== "string")
                throw new Error("Translation returned an invalid response");
              translatedParts.push(translation);
            }
            const translation = translatedParts.join("");
            rememberTranslation(`${locale}\u0000${source}`, translation);
            targets.forEach((target) => applyTarget(target, translation));
            continue;
          }

          const batch: Array<{
            id: string;
            text: string;
            targets: TranslationTarget[];
          }> = [];
          let characters = 0;
          for (const [text, targets] of pending) {
            if (
              batch.length &&
              (batch.length >= MAX_BATCH_ITEMS ||
                characters + text.length > MAX_BATCH_CHARACTERS)
            ) {
              break;
            }
            pending.delete(text);
            batch.push({ id: String(batch.length), text, targets });
            characters += text.length;
          }

          const response = await fetch("/api/i18n/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              locale,
              texts: batch.map(({ id, text }) => ({ id, text })),
            }),
            signal: controller.signal,
          });
          if (!response.ok)
            throw new Error(`Translation failed (${response.status})`);
          const result = (await response.json()) as TranslationResponse;
          const byId = new Map(
            (result.translations ?? []).map((item) => [item.id, item.text]),
          );

          for (const item of batch) {
            const translation = byId.get(item.id) ?? item.text;
            rememberTranslation(`${locale}\u0000${item.text}`, translation);
            item.targets.forEach((target) => applyTarget(target, translation));
          }
        }
        if (!stopped)
          document.documentElement.dataset.translationState = "complete";
      } catch (error) {
        if (
          !stopped &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          document.documentElement.dataset.translationState = "error";
          console.error("Automatic site translation failed.", error);
        }
      } finally {
        flushing = false;
        if (pending.size) scheduleFlush();
      }
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData")
          queueText(mutation.target as Text);
        else if (mutation.type === "attributes") {
          if (mutation.attributeName)
            queueAttribute(mutation.target as Element, mutation.attributeName);
        } else {
          mutation.addedNodes.forEach(scan);
        }
      }
    });

    scan(document.body);
    const title = document.querySelector("title")?.firstChild;
    if (title) queueText(title as Text);
    if (!pending.size)
      document.documentElement.dataset.translationState = "complete";
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATED_ATTRIBUTES, "value"],
    });

    return () => {
      stopped = true;
      if (flushTimer) clearTimeout(flushTimer);
      if (cacheWriteTimer) clearTimeout(cacheWriteTimer);
      persistCache();
      controller.abort();
      observer.disconnect();
    };
  }, [locale]);

  return null;
}
