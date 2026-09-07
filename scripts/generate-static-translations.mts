import { promises as fs } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourceRoots = [
  path.join(root, "src", "app"),
  path.join(root, "src", "components"),
];
const outputDirectory = path.join(
  root,
  "src",
  "lib",
  "i18n",
  "static-translations",
);
const providerUrl = process.env.LIBRETRANSLATE_URL?.replace(/\/$/, "");
const providerKey = process.env.LIBRETRANSLATE_API_KEY;
const dictionaryDirectory = process.env.STATIC_DICTIONARY_DIR;
const locales = ["es", "pt", "fr", "hi", "bn"] as const;
const visibleAttributes = new Set([
  "alt",
  "aria-description",
  "aria-label",
  "label",
  "placeholder",
  "title",
]);
const visibleProperties = new Set([
  "caption",
  "copy",
  "description",
  "eyebrow",
  "heading",
  "label",
  "message",
  "subtitle",
  "text",
  "title",
]);

if (!providerUrl && !dictionaryDirectory) {
  throw new Error(
    "Set LIBRETRANSLATE_URL or STATIC_DICTIONARY_DIR before generating the catalog.",
  );
}

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return filesUnder(fullPath);
      return /\.(tsx|ts)$/.test(entry.name) && !/\.test\./.test(entry.name)
        ? [fullPath]
        : [];
    }),
  );
  return files.flat();
}

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function looksVisible(value: string) {
  const text = normalize(value);
  return (
    text.length >= 2 &&
    text.length <= 600 &&
    /\p{L}/u.test(text) &&
    !/^https?:\/\//.test(text) &&
    !text.startsWith("/") &&
    !/^[a-z0-9_./:-]+$/.test(text)
  );
}

function propertyName(node: ts.PropertyName) {
  return ts.isIdentifier(node) || ts.isStringLiteral(node) ? node.text : "";
}

function collectRenderedStrings(filePath: string, source: string) {
  const strings = new Set<string>();
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const add = (value: string) => {
    const text = normalize(value);
    if (looksVisible(text)) strings.add(text);
  };

  function collectExpression(expression: ts.Expression) {
    if (
      ts.isStringLiteral(expression) ||
      ts.isNoSubstitutionTemplateLiteral(expression)
    ) {
      add(expression.text);
      return;
    }
    if (ts.isConditionalExpression(expression)) {
      collectExpression(expression.whenTrue);
      collectExpression(expression.whenFalse);
      return;
    }
    if (ts.isParenthesizedExpression(expression))
      collectExpression(expression.expression);
  }

  function visit(node: ts.Node) {
    if (ts.isJsxText(node)) add(node.getText(sourceFile));

    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      visibleAttributes.has(node.name.text)
    ) {
      if (node.initializer && ts.isStringLiteral(node.initializer))
        add(node.initializer.text);
      if (
        node.initializer &&
        ts.isJsxExpression(node.initializer) &&
        node.initializer.expression
      )
        collectExpression(node.initializer.expression);
    }

    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
    )
      collectExpression(node.expression);

    if (
      ts.isPropertyAssignment(node) &&
      visibleProperties.has(propertyName(node.name))
    )
      collectExpression(node.initializer);

    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sourceFile);
      if (
        /^(?:window\.)?(?:alert|confirm)$/.test(callee) ||
        /^(?:setError|setStatus|setNoteStatus|setAiText)$/.test(callee)
      ) {
        for (const argument of node.arguments) collectExpression(argument);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return strings;
}

async function translateBatch(locale: string, texts: string[]) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(`${providerUrl}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: texts,
          source: "en",
          target: locale,
          format: "text",
          ...(providerKey ? { api_key: providerKey } : {}),
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!response.ok) throw new Error(`Provider returned ${response.status}`);
      const payload = (await response.json()) as { translatedText?: unknown };
      const translations = Array.isArray(payload.translatedText)
        ? payload.translatedText
        : typeof payload.translatedText === "string"
          ? [payload.translatedText]
          : [];
      if (
        translations.length !== texts.length ||
        translations.some((translation) => typeof translation !== "string")
      )
        throw new Error("Provider returned an invalid translation");
      return translations as string[];
    } catch (error) {
      lastError = error;
      if (attempt < 4)
        await new Promise((resolve) =>
          setTimeout(resolve, 1_500 * (attempt + 1)),
        );
    }
  }
  throw lastError;
}

function dictionaryTranslation(raw: string) {
  for (const section of raw.split("@")) {
    const separator = section.indexOf(".");
    const values = separator >= 0 ? section.slice(separator + 1) : section;
    const candidate = values.split(",")[0]?.trim();
    if (candidate)
      return candidate.replace(/_(?:m|f|n)$/i, "").replaceAll("_", " ");
  }
  return "";
}

async function loadDictionary(locale: string) {
  if (!dictionaryDirectory) return null;
  const source = await fs.readFile(
    path.join(dictionaryDirectory, `en_${locale}.txt`),
    "utf8",
  );
  const dictionary = new Map<string, string>();
  for (const line of source.split(/\r?\n/)) {
    const separator = line.indexOf("\t");
    if (separator <= 0) continue;
    const word = line.slice(0, separator).trim().toLowerCase();
    const translation = dictionaryTranslation(line.slice(separator + 1));
    if (word && translation && !dictionary.has(word))
      dictionary.set(word, translation);
  }
  return dictionary;
}

function preserveCase(source: string, translated: string, locale: string) {
  if (source === source.toUpperCase())
    return translated.toLocaleUpperCase(locale);
  if (source[0] === source[0]?.toUpperCase())
    return `${translated[0]?.toLocaleUpperCase(locale) ?? ""}${translated.slice(1)}`;
  return translated;
}

function translateWordByWord(
  text: string,
  dictionary: Map<string, string>,
  locale: string,
) {
  return text.replace(/[A-Za-z]+(?:['’][A-Za-z]+)?/g, (word) => {
    const translation = dictionary.get(word.toLowerCase());
    return translation ? preserveCase(word, translation, locale) : word;
  });
}

const files = (await Promise.all(sourceRoots.map(filesUnder))).flat();
const english = new Set<string>();
const countsByFile: Array<[string, number]> = [];
for (const file of files) {
  const source = await fs.readFile(file, "utf8");
  const strings = collectRenderedStrings(file, source);
  countsByFile.push([path.relative(root, file), strings.size]);
  for (const text of strings) english.add(text);
}

process.stdout.write(`Found ${english.size} stable interface strings.\n`);
if (process.env.STATIC_TRANSLATION_DRY_RUN === "1") {
  for (const [file, count] of countsByFile
    .filter(([, count]) => count > 0)
    .sort((left, right) => right[1] - left[1]))
    process.stdout.write(`${count}\t${file}\n`);
  process.exit(0);
}
await fs.mkdir(outputDirectory, { recursive: true });
for (const locale of locales) {
  const outputPath = path.join(outputDirectory, `${locale}.json`);
  const existing = JSON.parse(
    await fs.readFile(outputPath, "utf8").catch(() => "{}"),
  ) as Record<string, string>;
  const ordered = [...english].sort((left, right) => left.localeCompare(right));
  const dictionary = await loadDictionary(locale);
  const catalog: Record<string, string> = dictionary ? {} : existing;
  if (dictionary) {
    const words = new Set<string>();
    for (const text of ordered) {
      catalog[text] = translateWordByWord(text, dictionary, locale);
      for (const match of text.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)?/g))
        words.add(match[0].toLowerCase());
    }
    for (const word of words) {
      const translation = dictionary.get(word);
      if (translation) catalog[`__word:${word}`] = translation;
    }
    await fs.writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);
    process.stdout.write(`${locale}: ${ordered.length}/${ordered.length}\n`);
    continue;
  }
  const missing = ordered.filter((text) => !catalog[text]);
  let completed = ordered.length - missing.length;
  while (missing.length) {
    const batch: string[] = [];
    let characters = 0;
    while (
      missing.length &&
      batch.length < 4 &&
      characters + missing[0]!.length <= 600
    ) {
      const text = missing.shift()!;
      batch.push(text);
      characters += text.length;
    }
    if (!batch.length) batch.push(missing.shift()!);
    const translations = await translateBatch(locale, batch);
    batch.forEach((text, index) => {
      catalog[text] = translations[index]!;
    });
    completed += batch.length;
    await fs.writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);
    process.stdout.write(`${locale}: ${completed}/${ordered.length}\n`);
  }
}

process.stdout.write(
  `Generated ${english.size} static strings for ${locales.length} locales.\n`,
);
