#!/bin/bash
set -e
set -o pipefail
set -x  # Debug mode

echo "🔧 [CI] Starting pre-Xcode build script..."

# Go to repo root
cd "$(dirname "$0")/../"

# 1. Ensure Node.js (fallback: install via Homebrew instead of NVM)
if ! command -v node &>/dev/null; then
  echo "🚨 Node.js not found. Installing via Homebrew..."
  brew install node
fi
echo "✅ Node.js: $(node -v)"

# 2. JS dependencies
if [ -f "yarn.lock" ]; then
  yarn install --frozen-lockfile
elif [ -f "package-lock.json" ]; then
  npm ci
fi

# 3. Install CocoaPods
cd ios
if ! command -v pod &>/dev/null; then
  echo "🚨 CocoaPods not found. Installing..."
  sudo gem install cocoapods --no-document
fi

pod install --repo-update
cd ..

echo "✅ [CI] Pre-Xcode build script completed successfully!"
