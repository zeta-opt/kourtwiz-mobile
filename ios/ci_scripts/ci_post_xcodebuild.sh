#!/bin/zsh

set -e
set -x

echo "🚀 Starting S3 upload using Python (boto3)..."

# ✅ Ensure this runs in Xcode Cloud
if [[ -z "$CI_XCODEBUILD_ACTION" ]]; then
  echo "❌ Not in Xcode Cloud environment. Skipping upload."
  exit 0
fi

# ✅ Use repo root as base path
REPO_PATH="$CI_PRIMARY_REPOSITORY_PATH"

# ✅ Print environment for debugging
echo "🌍 CI Environment:"
echo "  REPO_PATH: $REPO_PATH"
echo "  CI_XCODEBUILD_ACTION: $CI_XCODEBUILD_ACTION"

# ✅ Check typical export path
DEFAULT_EXPORT_PATH="$REPO_PATH/ios/build/export"

echo "📂 Checking export path: $DEFAULT_EXPORT_PATH"
if [[ -d "$DEFAULT_EXPORT_PATH" ]]; then
  echo "📂 Export path contents:"
  ls -R "$DEFAULT_EXPORT_PATH"
else
  echo "⚠️ Export path not found. Falling back to full project search."
fi

# ✅ Search for IPA in repo (prioritize export path, then full repo)
echo "🔍 Searching for .ipa file..."

IPA_PATH=$(find "$DEFAULT_EXPORT_PATH" -type f -name "*.ipa" 2>/dev/null | head -n 1)

if [[ -z "$IPA_PATH" ]]; then
  echo "⚠️ No IPA found in export path. Searching entire repo..."
  IPA_PATH=$(find "$REPO_PATH" -type f -name "*.ipa" 2>/dev/null | head -n 1)
fi

# ✅ Exit if IPA not found
if [[ -z "$IPA_PATH" ]]; then
  echo "❌ IPA file not found in project!"
  echo "🛠️ Troubleshooting tips:"
  echo "  • Make sure 'xcodebuild -exportArchive' is used."
  echo "  • Ensure 'exportOptions.plist' is valid."
  echo "  • Confirm the archive step actually succeeded."
  echo "  • Check the output paths and IPA generation."
  exit 1
fi

echo "📦 Found IPA at: $IPA_PATH"

# ✅ Define S3 target
BUCKET="kourtwiz-android-artifactory-dev"
KEY="xcodecloud/$(basename "$IPA_PATH")"

# ✅ Install boto3 locally (no sudo)
echo "📥 Installing boto3..."
pip3 install boto3 --target ./python-packages

# ✅ Upload IPA to S3 using Python
echo "☁️ Uploading $IPA_PATH to s3://$BUCKET/$KEY..."

PYTHONPATH=./python-packages python3 <<EOF
import boto3
import os

session = boto3.Session(
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
    region_name=os.environ.get("AWS_REGION", "us-west-2")
)

s3 = session.client("s3")
ipa_path = "${IPA_PATH}"
bucket = "${BUCKET}"
key = "${KEY}"

print(f"⬆️ Uploading {ipa_path} to S3 as {key}...")

with open(ipa_path, "rb") as f:
    s3.upload_fileobj(f, bucket, key)

print("✅ Upload complete.")
EOF

# ✅ Clean up
rm -rf ./python-packages

echo "🎉 Done uploading to S3."
