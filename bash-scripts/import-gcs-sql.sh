#!/bin/bash

# Import production database to test database.

DB_INSTANCE='api'
EXPORT_DB='production'
IMPORT_DB='test'
BUCKET="gs://storage.dinify.app"
FOLDER="backups"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
EXPORT_FILE="db-export_$TIMESTAMP"

# create mysqldump and save it in GCS
echo "Exporting $EXPORT_DB from $api"
gcloud sql export sql $DB_INSTANCE $BUCKET/$FOLDER/$EXPORT_FILE \
    --database $EXPORT_DB
 
# download the bakup for editing
echo "Downloading backup"
gsutil cp $BUCKET/$FOLDER/$EXPORT_FILE ./$EXPORT_FILE

# replace the mysql dump file lines specifieng the database
echo "Editing file"
sed -e "s/USE \`production\`/USE \`test\`/" $EXPORT_FILE > ./tmp/$EXPORT_FILE
sed -e "s/-- Current Database: \`production\`/-- Current Database: \`test\`/" \
    ./tmp/$EXPORT_FILE > ./tmp/$EXPORT_FILE-edit

mv ./tmp/$EXPORT_FILE-edit ./$EXPORT_FILE

# upload back to GCS
echo "Uploading to GCS"
gsutil cp $EXPORT_FILE $BUCKET/$FOLDER

# import to test dabatase
echo "Importing to $IMPORT_DB"
gcloud sql import sql $DB_INSTANCE $BUCKET/$FOLDER/$EXPORT_FILE \
    --database $IMPORT_DB

# clean temp files
echo "cleaning up"
rm ./tmp/$EXPORT_FILE ./tmp/$EXPORT_FILE-edit

echo "DONE"
exit 0

#TODO: pass  args from command line
# TODO: don't create two files => run first script, and use its output for the second script

