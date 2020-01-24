//@ts-nocheck
'use strict';
const { google } = require('googleapis');
const fs = require('fs');
const { deflatten } = require('../../lib/json');
const { stringify } = require('../../lib/es6');
const TRANSLATIONS_DIR = './translations';
const SHEET_ID = '1y53cv1-nIGVPBm8Z-vMPxpqOKq70ah0lhfvSzto-Aeo';
const SHEET = `NO_NEED`;
const LANGS_RANGE = `${SHEET}!C1:AP1`;
const CONTENT_RANGE = `${SHEET}!A2:AP300`;

/**
 * Fetch, format and save translation strings.
 *
 * * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
const saveTranslations = async auth => {
  try {
    // fetch sheets
    const sheets = google.sheets({ version: 'v4', auth });
    const res1 = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: LANGS_RANGE,
      majorDimension: 'ROWS'
    });
    const langs = res1.data.values;
    console.log(`LANGS: ${langs}`);
    // create dirs
    createDirs(langs[0], TRANSLATIONS_DIR);

    const res2 = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: CONTENT_RANGE,
      majorDimension: 'ROWS'
    });
    const rows = res2.data.values;
    for (const [i, lang] of langs[0].entries()) {
      console.log(`LANG: ${lang}`);
      saveForLanguage(rows, lang, i);
    }
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Saves translations for a single language.
 *
 * @param {Array<string[]>} rows
 * @param {string} lang
 * @param {number} langIndex
 */
const saveForLanguage = (rows, lang, langIndex) => {
  let keysObj = {};
  // row
  // ["APP"]
  // ["", "translation.key", "Translation Value", "translations Value", ...]
  let fileKey = '';
  for (const row of rows) {
    // create object when not at fileKey
    if (row.length > 1) {
      keysObj = {
        ...keysObj,
        [row[1]]: row[langIndex + 2]
      };
    }
    // save translations when at fileKey row
    if (row.length === 1 || !row.length) {
      // save object to file
      if (Object.keys(keysObj) && Object.keys(keysObj).length > 0) {
        const filePath = `${TRANSLATIONS_DIR}/${lang}/${fileKey}.js`;
        const obj = deflatten(keysObj);
        writeToFile(filePath, obj);
      }
      if (row.length === 1) {
        fileKey = row[0].toLowerCase();
        console.log(`NEW FILE KEY ${fileKey}`);
        keysObj = {};
      }
    }
  }
};

/**
 * Creates dirs for languages on specified path.
 *
 * @param {string[]} dirnanes langauges codes strings.
 * @param {*} path base path.
 * @returns void
 */
const createDirs = (dirnames, path) => {
  // create translations dir
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  // create dirs for languages
  for (const dirname of dirnames) {
    const dirPath = `${path}/${dirname}`;
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  }
};

/**
 * Write to file on a given path
 *
 * @param {string} path file path
 * @param {*} data
 */
const writeToFile = (path, data) => {
  try {
    console.log(`SAVING TO FILE ${path}`);
    fs.writeFileSync(path, stringify(data));
  } catch (err) {
    throw new Error(`Error writing to file ${path}: ` + err);
  }
};

module.exports = saveTranslations;
