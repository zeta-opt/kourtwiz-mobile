#!/bin/bash
set -e
set -o pipefail
set -x

echo "🔧 [CI] Starting Xcode Cloud post-clone script..."

# --- Go to workspace root ---
cd "$CI_WORKSPACE"

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

# --- Fix Code Signing Configuration ---
echo "🔧 Configuring code signing for Xcode Cloud..."
cd ios

# Debug: Show current signing settings
echo "📋 Current signing configuration:"
grep -A2 -B2 "CODE_SIGN\|DEVELOPMENT_TEAM\|PROVISIONING" kourtwizmobile.xcodeproj/project.pbxproj | head -20 || true

# Remove any hardcoded provisioning profiles and identities
echo "🧹 Cleaning up hardcoded signing settings..."
sed -i '' '/PROVISIONING_PROFILE_SPECIFIER/d' kourtwizmobile.xcodeproj/project.pbxproj || true
sed -i '' '/PROVISIONING_PROFILE = /d' kourtwizmobile.xcodeproj/project.pbxproj || true
sed -i '' '/"CODE_SIGN_IDENTITY\[sdk=iphoneos\*\]" = "iPhone/d' kourtwizmobile.xcodeproj/project.pbxproj || true

echo "✅ Code signing configuration cleaned"

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

# Return to workspace root
cd "$CI_WORKSPACE"

# --- Additional Debugging ---
echo "📊 Build environment info:"
echo "CI_XCODE_VERSION: $CI_XCODE_VERSION"
echo "CI_XCODEBUILD_ACTION: $CI_XCODEBUILD_ACTION"

echo "✅ [CI] Post-clone script completed successfully!"