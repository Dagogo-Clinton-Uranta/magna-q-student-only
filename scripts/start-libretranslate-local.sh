#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$PROJECT_ROOT/.libretranslate"
EXECUTABLE="$RUNTIME_DIR/venv/bin/libretranslate"

if [[ ! -x "$EXECUTABLE" ]]; then
  echo "LibreTranslate is not installed. Run 'npm run translation:install-local' first." >&2
  exit 1
fi

mkdir -p "$RUNTIME_DIR/data" "$RUNTIME_DIR/config" "$RUNTIME_DIR/cache" "$RUNTIME_DIR/models"
export XDG_DATA_HOME="$RUNTIME_DIR/data"
export XDG_CONFIG_HOME="$RUNTIME_DIR/config"
export XDG_CACHE_HOME="$RUNTIME_DIR/cache"
export ARGOS_PACKAGES_DIR="$RUNTIME_DIR/models"
export ARGOS_DEVICE_TYPE="cpu"

exec "$EXECUTABLE" \
  --host 127.0.0.1 \
  --port 5000 \
  --load-only en,es,pt,fr,hi,bn \
  --update-models \
  --disable-web-ui \
  --translation-cache all \
  --threads 4 \
  --req-limit 120 \
  --batch-limit 50 \
  --char-limit 16000
