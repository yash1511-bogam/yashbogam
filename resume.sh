#!/usr/bin/env bash
set -e
cd "$HOME"

INSTALL_DIR="$HOME/.yash"
REPO_URL="https://github.com/yash1511-bogam/yashbogam.git"
TMP_DIR=$(mktemp -d)

# ── Simple progress bar ──────────────────────────────────────────
progress() {
  local msg="$1"
  printf "\r  %s " "$msg"
  for i in 1 2 3 4 5; do printf "▓"; sleep 0.2; done
  for i in 1 2 3 4 5; do printf "▓"; sleep 0.1; done
  printf " ✓\n"
}

# ── Install bun if missing
if ! command -v bun >/dev/null 2>&1; then
  printf "  Installing Bun..."
  curl -fsSL https://bun.sh/install | bash >/dev/null 2>&1
  export PATH="$HOME/.bun/bin:$PATH"
  printf " ✓\n"
fi

# ── Download / Update
if [ -d "$INSTALL_DIR/.git" ]; then
  progress "Updating"
  cd "$INSTALL_DIR" && git pull --quiet origin main >/dev/null 2>&1
  bun install --silent >/dev/null 2>&1
else
  progress "Downloading"
  git clone --depth 1 --quiet "$REPO_URL" "$TMP_DIR/yash" >/dev/null 2>&1
  rm -rf "$INSTALL_DIR"
  mv "$TMP_DIR/yash" "$INSTALL_DIR"
  rm -rf "$TMP_DIR"
  cd "$INSTALL_DIR" && bun install --silent >/dev/null 2>&1
fi

# ── Add 'yash' command
ALIAS_LINE='alias yash="bun run $HOME/.yash/index.ts"'
SHELL_RC=""
if [ -f "$HOME/.zshrc" ]; then SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then SHELL_RC="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then SHELL_RC="$HOME/.bash_profile"
fi

if [ -n "$SHELL_RC" ]; then
  # remove old broken alias if present
  sed -i '' '/alias yash=/d' "$SHELL_RC" 2>/dev/null || true
  sed -i '' '/Terminal Portfolio/d' "$SHELL_RC" 2>/dev/null || true
  echo "# Yashwanth Bogam - Terminal Portfolio" >> "$SHELL_RC"
  echo "$ALIAS_LINE" >> "$SHELL_RC"
fi

printf "\n"

# ── Launch
bun run "$HOME/.yash/index.ts" </dev/tty
