#!/bin/bash
set -e
set -o pipefail
set -x

echo "🔧 [CI] Starting Xcode Cloud post-clone script..."
echo "📍 Current directory: $(pwd)"

# --- Go to repository root ---
# The script is in ios/ci_scripts/, so go up two levels
cd "$CI_WORKSPACE" || cd "$(dirname "$0")/../../"
echo "📍 Repository root: $(pwd)"

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
elif [ -f "package.json" ]; then
    echo "📦 Installing JS dependencies via npm (no lock file)..."
    npm install
else
    echo "⚠️ No package.json found, skipping JS deps installation"
fi

# --- Fix Code Signing Configuration ---
echo "🔧 Configuring code signing for Xcode Cloud..."

# Navigate to ios directory from repository root
if [ -d "ios" ]; then
    cd ios
    echo "📍 In iOS directory: $(pwd)"
else
    echo "❌ iOS directory not found!"
    ls -la
    exit 1
fi

# Set your team ID
TEAM_ID="R6499KF5HJ"
echo "📝 Setting Development Team to: $TEAM_ID"

# Debug: Show current signing settings
echo "📋 Current signing configuration:"
grep -A2 -B2 "CODE_SIGN\|DEVELOPMENT_TEAM\|PROVISIONING" kourtwizmobile.xcodeproj/project.pbxproj | head -20 || true

# Remove any hardcoded provisioning profiles and identities
echo "🧹 Cleaning up hardcoded signing settings..."
sed -i '' '/PROVISIONING_PROFILE_SPECIFIER/d' kourtwizmobile.xcodeproj/project.pbxproj || true
sed -i '' '/PROVISIONING_PROFILE = /d' kourtwizmobile.xcodeproj/project.pbxproj || true
sed -i '' '/"CODE_SIGN_IDENTITY\[sdk=iphoneos\*\]" = "iPhone/d' kourtwizmobile.xcodeproj/project.pbxproj || true

# Ensure DEVELOPMENT_TEAM is set correctly
echo "🔑 Setting development team..."
sed -i '' "s/DEVELOPMENT_TEAM = .*;/DEVELOPMENT_TEAM = $TEAM_ID;/g" kourtwizmobile.xcodeproj/project.pbxproj
# Also handle cases where DEVELOPMENT_TEAM might be empty or missing
sed -i '' "s/DEVELOPMENT_TEAM = \"\";/DEVELOPMENT_TEAM = $TEAM_ID;/g" kourtwizmobile.xcodeproj/project.pbxproj

# Ensure CODE_SIGN_STYLE is Automatic
sed -i '' "s/CODE_SIGN_STYLE = Manual;/CODE_SIGN_STYLE = Automatic;/g" kourtwizmobile.xcodeproj/project.pbxproj

echo "✅ Code signing configuration updated with team: $TEAM_ID"

# --- Install iOS Pods with fixes ---
if [ -f "Podfile" ]; then
    echo "📦 Installing iOS Pods..."
    
    # Add post_install hook if not present
    if ! grep -q "post_install do |installer|" Podfile; then
        echo "Adding post_install hook to fix deployment targets..."
        cat >> Podfile << 'EOF'

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Fix deployment target warnings
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
      
      # Ensure pods support automatic signing
      config.build_settings['CODE_SIGNING_ALLOWED'] = 'YES'
      
      # Set team ID for pods as well
      config.build_settings['DEVELOPMENT_TEAM'] = 'R6499KF5HJ'
    end
  end
  
  # Fix React-Core podspec issue if present
  installer.pods_project.targets.each do |target|
    if target.name == "React-Core"
      target.remove_from_project
    end
  end
end
EOF
    fi
    
    # Install pods
    pod install --repo-update
else
    echo "⚠️ No Podfile found, skipping pod install"
fi

# Return to repository root
cd "$CI_WORKSPACE" || cd ../

# --- Additional Debugging ---
echo "📊 Build environment info:"
echo "CI_XCODE_VERSION: $CI_XCODE_VERSION"
echo "CI_XCODEBUILD_ACTION: $CI_XCODEBUILD_ACTION"
echo "DEVELOPMENT_TEAM: $TEAM_ID"

# Verify team was set
echo "🔍 Verifying team ID was set:"
grep "DEVELOPMENT_TEAM" ios/kourtwizmobile.xcodeproj/project.pbxproj | head -5 || echo "Could not verify team ID"

echo "✅ [CI] Post-clone script completed successfully!"