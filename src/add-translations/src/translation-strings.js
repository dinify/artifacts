//@ts-nocheck
const { google } = require('googleapis');
const fs = require('fs');
const { flatten, deflatten } = require('../../lib/json');

const FILES = ['APP', 'CORE', 'WAITERBOARD', 'DASHBOARD'];
const TRANSLATIONS_DIR = './translations';
const SHEET_ID = '1y53cv1-nIGVPBm8Z-vMPxpqOKq70ah0lhfvSzto-Aeo';
const SHEET = `NO_NEED`;
const LANGS_RANGE = `${SHEET}!D1:AP1`;
const KEYS_RANGE = `${SHEET}!A3:B310`;
const TEST_RANGE = `${SHEET}!A3:C104`;

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
    // TODO: uncomment
    // createDirs(langs[0], TRANSLATIONS_DIR);

    const res2 = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: TEST_RANGE,
      majorDimension: 'ROWS'
    });
    const rows = res2.data.values;
    console.log(JSON.stringify(rows, null, 2));
    createKeysObject(rows, langs[0]);
    // const formated = formatForSave(langs[0]);
    // return formated;
  } catch (error) {
    throw error;
  }
};

const formatForLanguage = cols => {
  const keys = {}; // todo: take column with keys and format it
  const forSaving = [];
  // todo: get translations for each language and assing the keys,
  // todo: create
  const langFolders = rows[0];
  return rows;

  // todo: return array of keyObjects (one for each of 'FILES')
};

const createKeysObject = (rows, langs) => {
  let keysObj = {};
  // TODO: assign 'FOLDERS' first
  // TODO: iterate over languages
  // row
  // ["APP", "..."]
  // ["", "kokot.pica"]
  let fileKey = '';
  for (const row of rows) {
    // assign fileKey
    if (row[0].length) {
      // save object to file
      if (Object.keys(keysObj).length > 0) {
        console.log(JSON.stringify(keysObj, null, 2));
        const obj = deflatten(keysObj);
        const filePath = `${TRANSLATIONS_DIR}/${langs[0]}/${fileKey}.json`;
        console.log(`SAVING TO FILE ${filePath}`);
        // console.log(JSON.stringify(obj, null, 2));
        // TODO: save, and crete new object
        writeToFile(filePath, obj);
      }
      fileKey = row[0].toLowerCase();
      console.log('NEW FILE KEY');
    }
    let attrs = fileKey + '.' + row[1];
    let val = row[2];

    keysObj = {
      ...keysObj,
      [attrs]: val
    };
  }

  return keysObj;
};

// todo: take rows of one languages column and assign values to keys
const assignKeys = (rows, keysObj) => {
  for (const key of keysObj) {
    i++;
    keysObj[key] = rows[i];
  }
  return {};
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
  console.log(`DIRNAMES: ${dirnames}`);

  // create dirs for languages
  for (const dirname of dirnames) {
    const dirPath = `${path}/${dirname}`;
    // TODO: remove lowercase when langs
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    createFiles(FILES, dirPath, { hello: 'hey' });
  }
};

/**
 * Creates files for translations.
 *
 * @param {*string} filenames
 * @param {*} path
 */
const createFiles = (filenames, path) => {
  // create file for each part of the translation strings
  console.log(`DIRNAMES: ${filenames}`);
  for (const filename of filenames) {
    // TODO: remove lowercase when langs
    fs.writeFileSync(`${path}/${filename.toLowerCase()}.json`, '');
  }
};

/**
 * Write to file on a given path
 *
 * @param {string} path
 * @param {*} data
 */
const writeToFile = (path, data) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (err) {
    throw new Error(`Error writing to file ${path}: ` + err);
  }
};

// TODO: create keys
// TODO: read by column

module.exports = saveTranslations;
