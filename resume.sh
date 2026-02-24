#!/usr/bin/env bash
set -e

export HOME="${HOME:-$(eval echo ~)}"
cd "$HOME"

INSTALL_DIR="$HOME/.yash"
REPO_URL="https://github.com/yash1511-bogam/yashbogam.git"
TMP_DIR=$(mktemp -d)

progress() {
  printf "\r  %s " "$1"
  for i in 1 2 3 4 5 6 7 8 9 10; do printf "▓"; sleep 0.08; done
  printf " ✓\n"
}

if ! command -v bun >/dev/null 2>&1; then
  printf "  Installing Bun..."
  curl -fsSL https://bun.sh/install | bash >/dev/null 2>&1
  export PATH="$HOME/.bun/bin:$PATH"
  printf " ✓\n"
fi

if [ -d "$INSTALL_DIR/.git" ]; then
  cd "$INSTALL_DIR"
  git fetch --quiet origin main 2>/dev/null || true
  LOCAL=$(git rev-parse HEAD 2>/dev/null || echo "none")
  REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "none2")
  if [ "$LOCAL" != "$REMOTE" ]; then
    progress "Updating"
    git pull --quiet origin main >/dev/null 2>&1
    bun install --silent >/dev/null 2>&1
  fi
  cd "$HOME"
else
  progress "Downloading"
  git clone --depth 1 --quiet "$REPO_URL" "$TMP_DIR/yash" >/dev/null 2>&1
  rm -rf "$INSTALL_DIR"
  mv "$TMP_DIR/yash" "$INSTALL_DIR"
  rm -rf "$TMP_DIR"
  cd "$INSTALL_DIR" && bun install --silent >/dev/null 2>&1
  cd "$HOME"
fi

# ── Add 'yash' command
ALIAS_LINE="alias yash='bash $HOME/.yash/launch.sh'"
SHELL_RC=""
if [ -f "$HOME/.zshrc" ]; then SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then SHELL_RC="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then SHELL_RC="$HOME/.bash_profile"
fi

if [ -n "$SHELL_RC" ]; then
  sed -i '' '/alias yash=/d' "$SHELL_RC" 2>/dev/null || true
  sed -i '' '/Terminal Portfolio/d' "$SHELL_RC" 2>/dev/null || true
  echo "# Yashwanth Bogam - Terminal Portfolio" >> "$SHELL_RC"
  echo "$ALIAS_LINE" >> "$SHELL_RC"
fi

printf "\n  ✓ Type 'yash' in a new terminal to launch\n\n"
bun run "$HOME/.yash/index.ts" </dev/tty
