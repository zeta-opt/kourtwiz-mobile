#!/bin/zsh

set -e
set -x

echo "🧹 Cleaning build..."
xcodebuild clean \
  -workspace ios/kourtwizmobile.xcworkspace \
  -scheme kourtwizmobile \
  -configuration Release

echo "📦 Archiving..."
xcodebuild archive \
  -workspace ios/kourtwizmobile.xcworkspace \
  -scheme kourtwizmobile \
  -configuration Release \
  -archivePath ios/build/kourtwizmobile.xcarchive \
  -sdk iphoneos

echo "📤 Exporting IPA..."
xcodebuild -exportArchive \
  -archivePath ios/build/kourtwizmobile.xcarchive \
  -exportPath ios/build/ \
  -exportOptionsPlist ios/ExportOptions.plist

echo "✅ IPA exported to: ios/build/kourtwizmobile.ipa"
