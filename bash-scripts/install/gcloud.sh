#!/bin/zsh

# Google Cloud SDK
# https://cloud.google.com/storage/docs/gsutil_install
# https://cloud.google.com/sdk/docs/quickstart-macos

mkdir temp
cd temp
curl https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-263.0.0-darwin-x86_64.tar.gz
tar -xzvf google-cloud-sdk-263.0.0-darwin-x86_64.tar.gz
./google-cloud-sdk/install.sh
curl https://sdk.cloud.google.com | bash
rm -rf temp
exec -l $SHELL
gcloud init