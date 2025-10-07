#!/bin/zsh

set -e
set -x

echo "🚀 Starting S3 upload using Python (boto3)..."

# ✅ Check if running in Xcode Cloud
if [[ -z "$CI_XCODEBUILD_ACTION" ]]; then
  echo "❌ Not in Xcode Cloud environment. Skipping upload."
  exit 0
fi

# ✅ Set full path to known IPA
REPO_PATH="$CI_PRIMARY_REPOSITORY_PATH"
IPA_PATH="$REPO_PATH/ios/build/kourtwizmobile.ipa"

# ✅ Validate IPA file
if [[ ! -f "$IPA_PATH" ]]; then
  echo "❌ IPA file not found at expected path: $IPA_PATH"
  exit 1
fi

echo "📦 Found IPA at: $IPA_PATH"

# ✅ S3 settings
BUCKET="kourtwiz-android-artifactory-dev
