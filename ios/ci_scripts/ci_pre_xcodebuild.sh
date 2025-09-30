#!/bin/bash
set -e
set -o pipefail
set -x  # Debug mode

echo "🔧 [CI] Starting pre-Xcode build script..."

# --- Determine script and repo root directories ---
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
echo "✅ npm: $(npm -v)"
if command -v yarn &>/dev/null; then
  echo "✅ Yarn: $(yarn -v)"
fi

# --- Install JS dependencies ---
JS_DEP_FOUND=false

if [ -f "$REPO_ROOT/yarn.lock" ]; then
  echo "📦 Installing JS dependencies via Yarn..."
  cd "$REPO_ROOT"
  yarn install --frozen-lockfile
  JS_DEP_FOUND=true
elif [ -f "$REPO_ROOT/package-lock.json" ]; then
  echo "📦 Installing JS dependencies via npm..."
  cd "$REPO_ROOT"
  npm ci
  JS_DEP_FOUND=true
elif [ -f "../yarn.lock" ]; then
  echo "📦 Installing JS dependencies via Yarn (one level up)..."
  cd ..
  yarn install --frozen-lockfile
  cd "$REPO_ROOT"
  JS_DEP_FOUND=true
elif [ -f "../package-lock.json" ]; then
  echo "📦 Installing JS dependencies via npm (one level up)..."
  cd ..
  npm ci
  cd "$REPO_ROOT"
  JS_DEP_FOUND=true
else
  echo "🚨 No JS lockfile found. Cannot continue!"
  exit 1
fi

# --- Install iOS Pods ---
if [ -f "$REPO_ROOT/ios/Podfile" ]; then
  echo "📦 Installing iOS Pods..."
  cd "$REPO_ROOT/ios"
  pod install --repo-update
  cd "$REPO_ROOT"
else
  echo "🚨 No Podfile found at ios/Podfile. Cannot continue!"
  exit 1
fi

echo "✅ [CI] Pre-Xcode build script completed successfully!"
