# Offline site translation

Magna-Q ships application-authored interface translations with the web app.
Long database-backed articles and test questions are translated on demand with
a self-hosted LibreTranslate service. Page text is not sent to OpenAI, Google,
Microsoft, or DeepL.

## Static interface catalog

Stable headings, instructions, buttons, labels, placeholders, and accessibility
copy are compiled into one JSON catalog per supported locale. Only the chosen
locale is loaded by the browser, and static translation makes no network
request. Current catalogs contain exact source strings plus word-level fallback
entries for interface strings assembled at runtime.

Regenerate catalogs after changing application-authored copy with either the
offline dictionaries or LibreTranslate:

```bash
STATIC_DICTIONARY_DIR=/path/to/rosetta/dictionaries npm run translation:generate-static
LIBRETRANSLATE_URL=http://127.0.0.1:5000 npm run translation:generate-static
```

The generated catalogs are committed under
`src/lib/i18n/static-translations/`. The offline dictionaries are generation
inputs only and are not shipped to browsers. The current word dictionaries are
from the freely usable
[Rosetta offline translation project](https://github.com/tachyon-ii/rosetta).

## Local setup

Start the companion service before the Next.js application:

```bash
npm run translation:start
npm run translation:logs
```

The first start downloads the English, Spanish, Portuguese, French, Hindi, and
Bengali model packages. They are retained in the `libretranslate_models` Docker
volume and are not downloaded again on an ordinary container restart. The
service is bound to `127.0.0.1:5000`, matching the default
`LIBRETRANSLATE_URL`.

Stop it without deleting its model volume:

```bash
npm run translation:stop
```

Do not use `docker compose down --volumes` unless the models should be deleted
and downloaded again.

If Docker is unavailable, install and run the isolated non-root version:

```bash
npm run translation:install-local
npm run translation:start-local
```

This uses `uv`, keeps the Python environment and downloaded models under the
ignored `.libretranslate/` directory, and does not modify system Python. Keep
the second command running alongside `npm run dev`.

## Production

Vercel functions cannot host the Python runtime and several hundred megabytes
of model data. Deploy `libretranslate/libretranslate:v1.8.4` as a companion
container on a persistent service such as Railway, Fly.io, or a VPS, with the
same `LT_LOAD_ONLY` value and a persistent volume mounted at
`/home/libretranslate/.cache`.

When using that Railway mount path, set these service variables so downloaded
Argos packages are written to the persistent volume:

```text
XDG_CACHE_HOME=/home/libretranslate/.cache
XDG_DATA_HOME=/home/libretranslate/.cache/data
XDG_CONFIG_HOME=/home/libretranslate/.cache/config
ARGOS_PACKAGES_DIR=/home/libretranslate/.cache/models
```

Set these server-only variables in Vercel:

```text
LIBRETRANSLATE_URL=https://translation.example.com
LIBRETRANSLATE_API_KEY=<service API key, when enabled>
```

Protect a publicly reachable instance with LibreTranslate API keys or a private
gateway. Never expose its API key with a `NEXT_PUBLIC_` prefix.

## Runtime behavior

The DOM observer applies the bundled selected-language catalog to static and
client-rendered interface copy immediately. It never calls Railway for static
text. Database article and question fields are marked
`data-translate-on-demand`; their translation button sends small sequential
batches through the Next.js route and stores completed results in browser
storage for later visits.

Elements marked `data-no-translate`, code, formulas, editable fields, scripts,
and styles are intentionally excluded. Input values entered by a student are
not modified; labels and placeholders are translated from the static catalog.
