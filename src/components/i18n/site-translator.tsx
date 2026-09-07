"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/components/i18n/i18n-provider";
import type { AppLocale } from "@/lib/i18n/config";
import { MESSAGE_PACKS } from "@/lib/i18n/messages";

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

const TRANSLATED_ATTRIBUTES = [
  "aria-label",
  "aria-description",
  "placeholder",
  "title",
  "alt",
] as const;
const EXCLUDED_SELECTOR = [
  "[data-no-translate]",
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

async function loadStaticTranslations(locale: AppLocale) {
  switch (locale) {
    case "es":
      return (await import("@/lib/i18n/static-translations/es.json")).default;
    case "pt":
      return (await import("@/lib/i18n/static-translations/pt.json")).default;
    case "fr":
      return (await import("@/lib/i18n/static-translations/fr.json")).default;
    case "hi":
      return (await import("@/lib/i18n/static-translations/hi.json")).default;
    case "bn":
      return (await import("@/lib/i18n/static-translations/bn.json")).default;
    default:
      return {};
  }
}

function withOriginalWhitespace(source: string, translated: string) {
  const start = source.search(/\S/);
  if (start < 0) return source;
  const end = source.search(/\s*$/);
  return `${source.slice(0, start)}${translated}${source.slice(end)}`;
}

function preserveCase(source: string, translated: string, locale: AppLocale) {
  if (source === source.toUpperCase())
    return translated.toLocaleUpperCase(locale);
  if (source[0] === source[0]?.toUpperCase())
    return `${translated[0]?.toLocaleUpperCase(locale) ?? ""}${translated.slice(1)}`;
  return translated;
}

function translateWithBundledWords(
  text: string,
  locale: AppLocale,
  catalog: Record<string, string>,
) {
  let changed = false;
  const translated = text.replace(/[A-Za-z]+(?:['’][A-Za-z]+)?/g, (word) => {
    const replacement = catalog[`__word:${word.toLowerCase()}`];
    if (!replacement) return word;
    changed = true;
    return preserveCase(word, replacement, locale);
  });
  return changed ? translated : undefined;
}

function excluded(element: Element | null) {
  return !element || Boolean(element.closest(EXCLUDED_SELECTOR));
}

/**
 * Applies the bundled offline catalog to all rendered page copy, including
 * database-backed articles, resources, guidelines, and questions.
 */
export function SiteTranslator() {
  const { locale } = useI18n();
  const textStates = useRef(new WeakMap<Text, TranslationState>());
  const attributeStates = useRef(
    new WeakMap<Element, Map<string, TranslationState>>(),
  );

  useEffect(() => {
    let stopped = false;
    let staticTranslations: Record<string, string> = {};

    document.documentElement.lang = locale;
    document.documentElement.dataset.translationState = "loading";

    function applyTarget(target: TranslationTarget, translated: string) {
      const output = withOriginalWhitespace(target.source, translated);
      const state = { source: target.source, output, locale };
      if (target.kind === "text") {
        if (!target.node.isConnected) return;
        const previous = textStates.current.get(target.node);
        if (
          target.node.data !== target.source &&
          target.node.data !== previous?.output
        )
          return;
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

    function addTarget(source: string, target: TranslationTarget) {
      const text = source.trim();
      if (!text || !/\p{L}/u.test(text)) return;
      if (locale === "en") {
        applyTarget(target, text);
        return;
      }

      // Reviewed messages are already rendered in the selected language.
      if (Object.values(MESSAGE_PACKS[locale]).includes(text)) return;

      const translation =
        staticTranslations[text] ??
        translateWithBundledWords(text, locale, staticTranslations) ??
        text;
      applyTarget(target, translation);
    }

    function queueText(node: Text) {
      if (excluded(node.parentElement)) return;
      const current = node.data;
      const previous = textStates.current.get(node);
      if (previous && current === previous.output && previous.locale === locale)
        return;
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
      if (previous && current === previous.output && previous.locale === locale)
        return;
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
      )
        queueAttribute(element, "value");
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

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData")
          queueText(mutation.target as Text);
        else if (mutation.type === "attributes") {
          if (mutation.attributeName)
            queueAttribute(mutation.target as Element, mutation.attributeName);
        } else mutation.addedNodes.forEach(scan);
      }
    });

    void (async () => {
      staticTranslations = (await loadStaticTranslations(locale)) as Record<
        string,
        string
      >;
      if (stopped) return;
      scan(document.body);
      const title = document.querySelector("title")?.firstChild;
      if (title) queueText(title as Text);
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [...TRANSLATED_ATTRIBUTES, "value"],
      });
      document.documentElement.dataset.translationState = "complete";
    })().catch((error) => {
      if (!stopped) {
        document.documentElement.dataset.translationState = "error";
        console.error("Static translation catalog could not be loaded.", error);
      }
    });

    return () => {
      stopped = true;
      observer.disconnect();
    };
  }, [locale]);

  return null;
}
