// @ts-nocheck
const request = require('request');
const { google } = require('googleapis');

const TRANSLATION_API = 'http://localhost:3000/translations/addForLanguage';
// const SPREADHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
const SPREADHEET_ID = '1ah2DrY3s66tdGYQ5gRhlEf0qptUC9CfIK_6VccC54_Y';
const RANGE = 'Sheet7!A1:C';
const OVERWRITE = true;

/**
 *
 * @param {*} body
 */
export function post(body) {
  request.post(
    TRANSLATION_API,
    {
      json: body
    },
    (err, res) => {
      if (err) throw new Error('Request error!');
      console.log(JSON.stringify(res.body, null, 2));
    }
  );
}

function buildBody(sheet) {
  let column = 2;
  let body = {
    language: '',
    overwrite: OVERWRITE,
    translations: []
  };
  if (!sheet.length) {
    console.error('No data found.');
  }
  sheet.map((row, i) => {
    if (i === 0) {
      body.language = row[column];
    } else {
      body.translations.push({
        en: row[0],
        translation: row[column]
      });
    }
  });
  return body;
}

/**
 * Uploads translations from sheet to dictionary.
 *
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
export function postTranslations(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: SPREADHEET_ID,
      range: RANGE
    },
    (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const rows = res.data.values;
      const body = buildBody(rows);
      console.log(JSON.stringify(body, null, 2));
      post(body);
    }
  );
}

// todo: do multiple requests
// todo: pass arguments from cmd line l(ang, sheet and range)
