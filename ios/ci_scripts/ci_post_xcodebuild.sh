#!/bin/zsh

set -e
set -x

echo "🚀 Starting S3 upload..."

# ✅ Confirm we're in Xcode Cloud
if [[ -z "$CI_XCODEBUILD_ACTION" ]]; then
  echo "❌ Not in Xcode Cloud environment. Skipping upload."
  exit 0
fi

# ✅ AWS credentials (provided in Xcode Cloud environment variables)
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
export AWS_REGION="${AWS_REGION:-us-west-2}"

# ✅ Install AWS CLI (locally, no sudo)
echo "📥 Downloading AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-macos-x86_64.zip" -o "awscliv2.zip"

echo "📦 Unzipping AWS CLI..."
unzip -q awscliv2.zip

echo "🛠️ Installing AWS CLI locally..."
./aws/install -i "$PWD/aws-cli" -b "$PWD/aws-cli-bin"

# ✅ Define path to local aws binary
AWS_CMD="$PWD/aws-cli-bin/aws"

# ✅ Verify AWS CLI
$AWS_CMD --version

# ✅ Find the IPA file
IPA_PATH=$(find "$PWD" -name "*.ipa" | head -n 1)

if [[ -z "$IPA_PATH" ]]; then
  echo "❌ IPA file not found!"
  exit 1
fi

echo "📦 Found IPA: $IPA_PATH"

# ✅ Set S3 target
BUCKET="kourtwiz-android-artifactory-dev"
KEY="xcodecloud/$(basename "$IPA_PATH")"

echo "☁️ Uploading $IPA_PATH to s3://$BUCKET/$KEY"
$AWS_CMD s3 cp "$IPA_PATH" "s3://$BUCKET/$KEY"

echo "✅ Upload complete."

# ✅ (Optional) Clean up AWS CLI files
rm -rf awscliv2.zip aws aws-cli aws-cli-bin
