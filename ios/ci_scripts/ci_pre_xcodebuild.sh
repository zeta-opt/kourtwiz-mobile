#!/bin/bash
set -e
set -o pipefail
set -x  # Debug mode

echo "🔧 [CI] Starting pre-Xcode build script..."

# --- Go to repo root (relative to this script) ---
cd "$(dirname "$0")/../"
echo "📂 Current directory: $(pwd)"

# --- Ensure Node.js ---
if ! command -v node &>/dev/null; then
  echo "🚨 Node.js not found. Installing via Homebrew..."
  brew install node
fi
echo "✅ Node.js: $(node -v)"

# --- Install JS dependencies ---
if [ -f "yarn.lock" ]; then
  echo "📦 Installing JS dependencies via Yarn..."
  yarn install --frozen-lockfile
elif [ -f "package-lock.json" ]; then
  echo "📦 Installing JS dependencies via npm..."
  npm ci
else
  echo "⚠️ No JS lockfile found, skipping JS deps installation"
fi

# --- Detect and install iOS Pods ---
PODFILE_PATH=""
if [ -f "ios/Podfile" ]; then
  PODFILE_PATH="ios/Podfile"
elif [ -f "Podfile" ]; then
  PODFILE_PATH="Podfile"
fi

if [ -n "$PODFILE_PATH" ]; then
  echo "📦 Installing iOS Pods (found at $PODFILE_PATH)..."
  cd "$(dirname "$PODFILE_PATH")"
  pod install --repo-update
  cd -  # return to previous dir
else
  echo "⚠️ No Podfile found, skipping pod install"
fi

echo "✅ [CI] Pre-Xcode build script completed successfully!"
