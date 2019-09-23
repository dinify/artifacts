rm -rf dist
mkdir ./dist
mkdir ./dist/i18n
find ./i18n -name '*.json' | cpio -pdm /dist/i18n
find . -name '*.json' -type f | while read NAME ; do mv "${NAME}" "${NAME%.json}" ; done