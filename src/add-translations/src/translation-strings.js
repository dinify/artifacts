//@ts-nocheck
const { google } = require('googleapis');
const fs = require('fs');

const FILES = ['APP', 'CORE', 'WAITERBOARD', 'DASHBOARD'];
const TRANSLATIONS_DIR = './translations';
const SHEET_ID = '1y53cv1-nIGVPBm8Z-vMPxpqOKq70ah0lhfvSzto-Aeo';
const RANGE = "'TRANSLATED STRINGS'";
const LANGS_RANGE = "'TRANSLATED STRINGS'!D1:AP1";

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

    // const res2 = await sheets.spreadsheets.values.get({
    //   spreadsheetId: SHEET_ID,
    //   range: LANGS_RANGE,
    //   majorDimension: 'COLUMNS'
    // });
    // const cols = res.data.values;
    const formated = formatForSave(langs[0]);
    return formated;
  } catch (error) {
    throw error;
  }
};

const formatForSave = rows => {
  // create dirs for languages if not existing
  const langFolders = rows[0];
  console.log(langFolders);
  return rows;
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
    createFiles(FILES, dirPath);
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
  for (const filename of filenames) {
    // TODO: remove lowercase when langs
    fs.writeFileSync(
      `${path}/${filename.toLowerCase()}.json`,
      JSON.stringify(
        {
          filename: filename,
          path: path
        },
        null,
        2
      )
    );
  }
};

// TODO: create keys
// TODO: read by column

module.exports = saveTranslations;
