B=${1}

if [ -z ${1+x} ]; 
  then (
    echo "use the first argument for bucket" && 
    echo "example: gs://static.dinify.dev"
  ) 1>&2 && exit 1; 
  else echo "Using bucket '$1'" && echo "Using config ../config/cors.json";
fi

gsutil cors set ../config/cors.json $B
gsutil cors get $B