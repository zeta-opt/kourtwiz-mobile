#!/bin/zsh


set -e

echo "Starting S3 upload..."

# Skip if not in CI
if [[ "$CI" != "true" ]]; then
  echo "Not in CI environment. Skipping upload."
  exit 0
fi

# Set AWS credentials (provided as env vars in Xcode Cloud)
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
export AWS_REGION="${AWS_REGION:-us-west-2}"

# Install AWS CLI
echo "Installing AWS CLI..."
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Locate the IPA
IPA_PATH=$(find "$PWD" -name "*.ipa" | head -n 1)

if [[ -z "$IPA_PATH" ]]; then
  echo "IPA not found!"
  exit 1
fi

# Upload
BUCKET="kourtwiz-android-artifactory-dev"
KEY="xcodecloud/$(basename "$IPA_PATH")"

echo "Uploading $IPA_PATH to s3://$BUCKET/$KEY"
aws s3 cp "$IPA_PATH" "s3://$BUCKET/$KEY"

echo "Upload complete."
