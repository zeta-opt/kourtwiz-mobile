#!/bin/zsh

set -e
set -x

echo "🚀 Starting S3 upload..."

# ✅ Optional: Check if we're in Xcode Cloud
if [[ -z "$CI_XCODEBUILD_ACTION" ]]; then
  echo "❌ Not in Xcode Cloud environment. Skipping upload."
  exit 0
fi

# ✅ AWS credentials (already injected via Xcode Cloud environment variables)
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
export AWS_REGION="${AWS_REGION:-us-west-2}"

# ✅ Sanity check: Ensure AWS CLI is available
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI not found. Exiting."
  exit 1
fi

# ✅ Locate the IPA file
IPA_PATH=$(find "$PWD" -name "*.ipa" | head -n 1)

if [[ -z "$IPA_PATH" ]]; then
  echo "❌ IPA file not found!"
  exit 1
fi

echo "📦 Found IPA: $IPA_PATH"

# ✅ Set S3 bucket and key
BUCKET="kourtwiz-android-artifactory-dev"
KEY="xcodecloud/$(basename "$IPA_PATH")"

echo "☁️ Uploading $IPA_PATH to s3://$BUCKET/$KEY"

# ✅ Upload the IPA to S3
aws s3 cp "$IPA_PATH" "s3://$BUCKET/$KEY"

echo "✅ Upload complete."
