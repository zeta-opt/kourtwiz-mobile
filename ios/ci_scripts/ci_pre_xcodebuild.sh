#!/bin/bash
set -e
set -o pipefail
set -x

echo "🔧 [CI] Starting pre-Xcode build script..."

# --- Determine repo root relative to script ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../" && pwd)"
cd "$REPO_ROOT"
echo "📂 Current directory (repo root): $REPO_ROOT"

# --- Ensure Node.js ---
if ! command -v node &>/dev/null; then
  echo "🚨 Node.js not found. Installing via Homebrew..."
  brew install node
fi
echo "✅ Node.js: $(node -v)"

# --- Install JS dependencies in repo root ---
JS_DEP_FOUND=false
if [ -f "$REPO_ROOT/yarn.lock" ]; then
  echo "📦 Installing JS dependencies via Yarn..."
  yarn install --frozen-lockfile
  JS_DEP_FOUND=true
elif [ -f "$REPO_ROOT/package-lock.json" ]; then
  echo "📦 Installing JS dependencies via npm..."
  npm ci
  JS_DEP_FOUND=true
else
  echo "🚨 No JS lockfile found at repo root. Pod install will fail!"
  exit 1
fi

# --- Install iOS Pods ---
if [ -f "$REPO_ROOT/ios/Podfile" ]; then
  echo "📦 Installing iOS Pods..."
  cd "$REPO_ROOT/ios"
  pod install --repo-update
  cd "$REPO_ROOT"
else
  echo "🚨 No Podfile found at ios/Podfile. Cannot run pod install!"
  exit 1
fi

echo "✅ [CI] Pre-Xcode build script completed successfully!"
