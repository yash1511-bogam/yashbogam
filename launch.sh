#!/usr/bin/env bash
set -e

export HOME="${HOME:-$(eval echo ~)}"
DIR="$HOME/.yash"

if [ -d "$DIR/.git" ]; then
  cd "$DIR"
  git fetch --quiet origin main 2>/dev/null || true
  LOCAL=$(git rev-parse HEAD 2>/dev/null || echo "none")
  REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "none2")
  if [ "$LOCAL" != "$REMOTE" ]; then
    printf "  Updating "
    git pull --quiet origin main >/dev/null 2>&1
    bun install --silent >/dev/null 2>&1
    for i in 1 2 3 4 5 6 7 8; do printf "▓"; sleep 0.1; done
    printf " ✓\n\n"
  fi
  cd "$HOME"
fi

exec bun run "$DIR/index.ts"
