#!/bin/bash

set -e  # Exit on any error
set -o pipefail  # Exit if any piped command fails

echo "🔧 [CI] Starting pre-Xcode build script..."

# Go to project root (adjust if needed)
cd "$(dirname "$0")/../"

# -----------------------
# 1. Ensure Node.js is installed
# -----------------------
if ! command -v node &>/dev/null; then
  echo "🚨 Node.js not found. Installing via NVM..."

  export NVM_DIR="$HOME/.nvm"
  if [ ! -d "$NVM_DIR" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
  fi

  source "$NVM_DIR/nvm.sh"
  nvm install 18  # Or whichever version your project uses
else
  echo "✅ Node.js found: $(node -v)"
fi

# -----------------------
# 2. Install JS dependencies
# -----------------------
if [ -f "yarn.lock" ]; then
  echo "📦 Installing dependencies via Yarn..."
  yarn install --frozen-lockfile
elif [ -f "package-lock.json" ]; then
  echo "📦 Installing dependencies via npm..."
  npm ci
else
  echo "⚠️ No lockfile found. Skipping JS dependency installation."
fi

# -----------------------
# 3. Patch Podfile (optional: skip autolinking if Node isn't ready)
# -----------------------
echo "🧩 Checking Podfile for dynamic requires..."
PODFILE="ios/Podfile"

if grep -q "require File.join(File.dirname(\`node" "$PODFILE"; then
  echo "🔄 Wrapping node require in a safe block..."

  sed -i '' -e $'1i\\\n\
begin\n\
  node_path = `which node`.strip\n\
  if !node_path.empty?\n\
    expo_package = `node --print "require.resolve(\'expo/package.json\')"` rescue nil\n\
    if expo_package && !expo_package.strip.empty?\n\
      require File.join(File.dirname(expo_package.strip), "scripts/autolinking")\n\
    end\n\
  else\n\
    puts "[!] Node.js not found. Skipping autolinking require."\n\
  end\n\
rescue => e\n\
  puts "[!] Error loading autolinking: #{e}"\n\
end\n' "$PODFILE"
fi

# -----------------------
# 4. Install CocoaPods
# -----------------------
echo "📦 Installing iOS Pods..."
pod install

echo "✅ [CI] Pre-Xcode build script completed successfully!"
