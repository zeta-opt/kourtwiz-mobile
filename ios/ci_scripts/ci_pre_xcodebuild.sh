#!/bin/bash
set -e
set -o pipefail
set -x  # Debug mode

echo "🔧 [CI] Starting pre-Xcode build script..."

# Go to repo root
cd "$(dirname "$0")/../"

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

# --- Install iOS Pods ---
if [ -f "ios/Podfile" ]; then
  echo "📦 Installing iOS Pods..."
  cd ios
  pod install --repo-update
  cd ..
else
  echo "⚠️ No Podfile found, skipping pod install"
fi

echo "✅ [CI] Pre-Xcode build script completed successfully!"
