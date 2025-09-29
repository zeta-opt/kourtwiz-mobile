#!/bin/bash
set -e
set -o pipefail
set -x  # Debug mode

echo "🔧 [CI] Starting pre-Xcode build script..."

# Go to repo root
cd "$(dirname "$0")/../"

# 1. Ensure Node.js (use Homebrew fallback if missing)
if ! command -v node &>/dev/null; then
  echo "🚨 Node.js not found. Installing via Homebrew..."
  brew install node
fi
echo "✅ Node.js: $(node -v)"

# 2. Install JS dependencies
if [ -f "yarn.lock" ]; then
  yarn install --frozen-lockfile
elif [ -f "package-lock.json" ]; then
  npm ci
fi

# 3. Install CocoaPods safely
if [ -f "ios/Podfile" ]; then
  echo "📦 Installing iOS Pods (inside ios/)..."
  (cd ios && pod install --repo-update)
elif [ -f "Podfile" ]; then
  echo "📦 Installing iOS Pods (at repo root)..."
  pod install --repo-update
else
  echo "⚠️ Podfile not found in ios/ or root. Skipping pod install."
fi

echo "✅ [CI] Pre-Xcode build script completed successfully!"
