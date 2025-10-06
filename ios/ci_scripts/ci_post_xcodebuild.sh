#!/bin/zsh

set -e
set -x

echo "🚀 Starting S3 upload using Python (boto3)..."

# ✅ Check if we're in Xcode Cloud
if [[ -z "$CI_XCODEBUILD_ACTION" ]]; then
  echo "❌ Not in Xcode Cloud environment. Skipping upload."
  exit 0
fi

# ✅ Find the IPA file
IPA_PATH=$(find "$PWD" -name "*.ipa" | head -n 1)

if [[ -z "$IPA_PATH" ]]; then
  echo "❌ IPA file not found!"
  exit 1
fi

echo "📦 Found IPA: $IPA_PATH"

# ✅ Set variables
BUCKET="kourtwiz-android-artifactory-dev"
KEY="xcodecloud/$(basename "$IPA_PATH")"

# ✅ Install boto3 locally (no sudo)
echo "📦 Installing boto3..."
pip3 install boto3 --target ./python-packages

# ✅ Upload using a Python one-liner
echo "☁️ Uploading to S3 using boto3..."

python3 <<EOF
import boto3
import os

session = boto3.Session(
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    region_name=os.environ.get("AWS_REGION", "us-west-2")
)

s3 = session.client("s3")
ipa_path = "${IPA_PATH}"
bucket = "${BUCKET}"
key = "${KEY}"

with open(ipa_path, "rb") as f:
    s3.upload_fileobj(f, bucket, key)

print("✅ Upload complete.")
EOF
