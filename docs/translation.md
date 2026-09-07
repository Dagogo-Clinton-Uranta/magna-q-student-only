# Browser-local site translation

Magna-Q translates all rendered page text in the user's browser with bundled
offline catalogs. This includes application interface text and dynamic content
loaded from the database, such as resources, guideline articles, question
stems, answer choices, rationales, and explanations.

Translation makes no request to Railway, LibreTranslate, OpenAI, Google,
Microsoft, or DeepL. There is no translation API key or translation service to
deploy. Each visitor downloads only the catalog for their selected language.

## Catalogs

One JSON catalog per supported non-English locale is committed under
`src/lib/i18n/static-translations/`. Each catalog contains exact stable
interface strings and the complete English-to-target-language word dictionary.
The exact entries improve recurring interface text; the complete word entries
allow previously unseen database content to be translated locally.

The current source dictionaries are from the freely usable
[Rosetta offline translation project](https://github.com/tachyon-ii/rosetta).
They are generation inputs only and are not required in production.

Regenerate the catalogs after changing application-authored copy or replacing
the source dictionaries:

```bash
STATIC_DICTIONARY_DIR=/path/to/rosetta/dictionaries npm run translation:generate-static
```

The directory must contain `en_es.txt`, `en_pt.txt`, `en_fr.txt`, `en_hi.txt`,
and `en_bn.txt`.

## Runtime behavior

The selected catalog is loaded once when the language changes. A DOM observer
translates current content and content added later by client navigation or a
database response. Original English values are retained in memory so switching
languages does not translate an already translated string.

Translation is deliberately literal and speed-first. Words missing from the
dictionary—including some medical terminology, names, abbreviations, and
brand names—remain unchanged. Elements marked `data-no-translate`, code,
formulas, editable fields, scripts, and styles are intentionally excluded.
Student-entered input values are never modified; their labels and placeholders
are translated.
