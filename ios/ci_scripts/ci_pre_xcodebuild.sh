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
if [ -f "$REPO_ROOT/Podfile" ]; then
  PODFILE_DIR="$REPO_ROOT"
elif [ -f "$REPO_ROOT/ios/Podfile" ]; then
  PODFILE_DIR="$REPO_ROOT/ios"
else
  echo "🚨 No Podfile found. Cannot continue!"
  exit 1
fi

echo "📦 Installing iOS Pods from $PODFILE_DIR..."
cd "$PODFILE_DIR"
pod install --repo-update
cd "$REPO_ROOT"


# --- Build and export IPA ---
echo "🏗️ Starting Xcode build and export..."

WORKSPACE_PATH="ios/MyApp.xcworkspace"      # <-- 🔁 Update this if needed
SCHEME="MyApp"                              # <-- 🔁 Update this if needed
ARCHIVE_PATH="$REPO_ROOT/ios/build/archive/MyApp.xcarchive"
EXPORT_PATH="$REPO_ROOT/ios/build/export"
EXPORT_OPTIONS_PLIST="$REPO_ROOT/ios/exportOptions.plist"  # <-- 🔁 Must exist

echo "📦 Archiving app..."
xcodebuild archive \
  -workspace "$WORKSPACE_PATH" \
  -scheme "$SCHEME" \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  -destination 'generic/platform=iOS' \
  SKIP_INSTALL=NO \
  BUILD_LIBRARY_FOR_DISTRIBUTION=YES

echo "📤 Exporting IPA..."
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS_PLIST"

# ✅ Confirm IPA exists
IPA_PATH=$(find "$EXPORT_PATH" -type f -name "*.ipa" | head -n 1)
if [[ -z "$IPA_PATH" ]]; then
  echo "❌ IPA file not found after export!"
  exit 1
fi

echo "✅ IPA exported successfully at: $IPA_PATH"

echo "✅ [CI] Pre-Xcode build script completed successfully!"

echo "✅ [CI] Pre-Xcode build script completed successfully!"
