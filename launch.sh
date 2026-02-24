#!/usr/bin/env bash
set -e
cd "$HOME"

DIR="$HOME/.yash"

# ── Check for updates silently
if [ -d "$DIR/.git" ]; then
  cd "$DIR"
  git fetch --quiet origin main 2>/dev/null || true
  LOCAL=$(git rev-parse HEAD 2>/dev/null)
  REMOTE=$(git rev-parse origin/main 2>/dev/null)
  if [ "$LOCAL" != "$REMOTE" ]; then
    printf "  Updating "
    git pull --quiet origin main >/dev/null 2>&1
    bun install --silent >/dev/null 2>&1
    for i in 1 2 3 4 5 6 7 8; do printf "▓"; sleep 0.1; done
    printf " ✓\n\n"
  fi
fi

exec bun run "$DIR/index.ts"
