rm -rf dist
mkdir ./dist
mkdir ./dist/i18n
find ./i18n -name '*.json' | cpio -pdm ./dist
find ./dist -name '*.json' -type f | while read NAME ; do mv "${NAME}" "${NAME%.json}" ; done
nvm use 12
node ../node_scripts/build-i18n.js -s $1