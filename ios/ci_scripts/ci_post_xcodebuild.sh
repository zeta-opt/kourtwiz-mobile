#!/bin/zsh

set -e
set -x

echo "🚀 Starting S3 upload using Python (boto3)..."

# ✅ Check if running inside Xcode Cloud
if [[ -z "$CI_XCODEBUILD_ACTION" ]]; then
  echo "❌ Not in Xcode Cloud environment. Skipping upload."
  exit 0
fi

# ✅ Define repo path (automatically set in Xcode Cloud)
REPO_PATH="$CI_PRIMARY_REPOSITORY_PATH"

# ✅ Debug: Find the .ipa file inside the repo
echo "🔍 Searching for .ipa files inside $REPO_PATH..."
IPA_PATH=$(find "$REPO_PATH" -name "*.ipa" 2>/dev/null | head -n 1)

if [[ -z "$IPA_PATH" ]]; then
  echo "❌ IPA file not found!"
  exit 1
fi

echo "📦 Found IPA at: $IPA_PATH"

# ✅ Set S3 bucket and key
BUCKET="kourtwiz-android-artifactory-dev"
KEY="xcodecloud/$(basename "$IPA_PATH")"

# ✅ Install boto3 (locally, no sudo)
echo "📥 Installing boto3..."
pip3 install boto3 --target ./python-packages

# ✅ Upload IPA using Python + boto3
echo "☁️ Uploading $IPA_PATH to s3://$BUCKET/$KEY..."

PYTHONPATH=./python-packages python3 <<EOF
import boto3
import os

# Create session using environment variables from Xcode Cloud
session = boto3.Session(
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
    region_name=os.environ.get("AWS_REGION", "us-west-2")
)

s3 = session.client("s3")

ipa_path = "${IPA_PATH}"
bucket = "${BUCKET}"
key = "${KEY}"

with open(ipa_path, "rb") as f:
    s3.upload_fileobj(f, bucket, key)

print("✅ Upload to S3 complete.")
EOF

# ✅ Optional: clean up Python packages
rm -rf ./python-packages

echo "🎉 Done uploading to S3!"
