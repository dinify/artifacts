case "$ENV" in
 "production") BUCKET="gs://static.dinify.app" ;;
    *) BUCKET="gs://static.dinify.dev" ;;
esac
gsutil -m -h "Content-Type:application/json" cp -r ./dist/* $BUCKET