#!/bin/zsh

SRC=./node_modules/@phensley/cldr/packs
DIST=./dist/i18n/packs

mkdir -p $DIST
cd $SRC
find . -name '*.json' | cpio -pdm ../../../../$DIST
cd ../../../..
rm $DIST/resource.json
find $DIST -name '*.json' -type f | while read NAME ; do mv "${NAME}" "${NAME%.json}" ; done