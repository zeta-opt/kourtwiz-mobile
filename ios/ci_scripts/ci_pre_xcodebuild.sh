#!/bin/bash
set -e
set -o pipefail
set -x  # Debug mode

echo "🔧 [CI] Starting pre-Xcode build script..."

# --- Determine repo root relative to this script ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../" && pwd)"
cd "$REPO_ROOT"
echo "📂 Current directory (repo root): $REPO_ROOT"

# --- Ensure Node.js ---
if ! command -v node &>/dev/null; then
  echo "🚨 Node.js not found. Installing via Homebrew..."
  brew install node
fi
echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
if command -v yarn &>/dev/null; then
  echo "✅ Yarn version: $(yarn -v)"
fi

# --- Install JS dependencies ---
JS_DEP_FOUND=false
if [ -f "yarn.lock" ]; then
  echo "📦 Installing JS dependencies via Yarn..."
  yarn install --frozen-lockfile
  JS_DEP_FOUND=true
elif [ -f "package-lock.json" ]; then
  echo "📦 Installing JS dependencies via npm..."
  npm ci
  JS_DEP_FOUND=true
else
  echo "⚠️ No JS lockfile found, skipping JS deps installation"
fi

# --- Install iOS Pods ---
PODFILE_PATH=""
if [ -f "ios/Podfile" ]; then
  PODFILE_PATH="ios/Podfile"
elif [ -f "Podfile" ]; then
  PODFILE_PATH="Podfile"
fi

if [ -n "$PODFILE_PATH" ]; then
  echo "📦 Installing iOS Pods (found at $PODFILE_PATH)..."

  # Ensure JS dependencies are installed before pod install
  if [ "$JS_DEP_FOUND" = false ]; then
    echo "⚠️ JS dependencies not found! Pod install may fail due to missing React Native modules."
  fi

  cd "$(dirname "$PODFILE_PATH")"
  pod install --repo-update
  cd "$REPO_ROOT"  # return to repo root
else
  echo "⚠️ No Podfile found, skipping pod install"
fi

echo "✅ [CI] Pre-Xcode build script completed successfully!"
