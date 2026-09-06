#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$PROJECT_ROOT/.libretranslate"
export UV_CACHE_DIR="$RUNTIME_DIR/uv-cache"

if ! command -v uv >/dev/null 2>&1; then
  echo "uv is required for the non-Docker LibreTranslate installation." >&2
  exit 1
fi

mkdir -p "$RUNTIME_DIR"
uv venv --python 3.11 "$RUNTIME_DIR/venv"
uv pip install --python "$RUNTIME_DIR/venv/bin/python" \
  --index-url https://download.pytorch.org/whl/cpu \
  "torch==2.4.0"
uv pip install --python "$RUNTIME_DIR/venv/bin/python" \
  "libretranslate==1.8.4" \
  "setuptools<81"

echo "LibreTranslate is installed in $RUNTIME_DIR/venv."
echo "Run 'npm run translation:start-local' to download/load the language models."
