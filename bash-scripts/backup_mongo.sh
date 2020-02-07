#!/bin/bash

# This script is deployed on mongodb virtual machine and triggered by a cronjob
# every friday at 17 UTC+0
# 0 17 * * 5 /home/zdeno/scripts/backup_mongo.sh
# So far it only creates mongodump of the translations collection, whic hsi
# then uploaded to the "backups" bucket


BUCKET="gs://storage.dinify.app"
FOLDER="backups"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ"
OUT_DIR="./tmp/translations_dump/translations"
COLLECTION="translations"

echo "Creating back up"
mongodump --host=10.164.0.10 --collection=$COLLECTION --db=translations --out ./tmp/translations_dump

# add timestamp to dir
mv $OUT_DIR $OUT_DIR-$TIMESTAMP

echo "Uploading to GCS"
gsutil cp -r $OUT_DIR-$TIMESTAMP/ $BUCKET/$FOLDER

echo "cleaning files"
rm -r ./tmp/translations_dump
