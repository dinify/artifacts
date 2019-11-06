#!/bin/zsh

SRC=./src/i18n/supplemental
DIST=./dist/i18n/supplemental

mkdir -p $DIST
cd $SRC
find . -name '*.json' | cpio -pdm ../../../$DIST
cd ../../..
find $DIST -name '*.json' -type f | while read NAME ; do mv "${NAME}" "${NAME%.json}" ; done