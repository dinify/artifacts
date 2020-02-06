// @ts-nocheck
const request = require('request');
const { google } = require('googleapis');

const TRANSLATION_API = 'http://localhost:3000/translations/addForLanguage';
const SPREADHEET_ID = '1ah2DrY3s66tdGYQ5gRhlEf0qptUC9CfIK_6VccC54_Y';
const RANGE = 'Sheet7!A1:AN';
const OVERWRITE = true;

const post = async body => {
  return new Promise((resolve, reject) => {
    request.post(
      TRANSLATION_API,
      {
        json: body
      },
      (err, res) => {
        if (err) reject(err);
        resolve(res.body);
      }
    );
  });
};

const buildBody = (sheet, column) => {
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
};

const postTranslations = async auth => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADHEET_ID,
      range: RANGE
    });
    const rows = res.data.values;
    for (let i = 0; i < rows[0].length; i++) {
      const body = buildBody(rows, i);
      const upload = await post(body);
      console.log(upload);
    }
    return 0;
  } catch (error) {
    throw error;
  }
};

module.exports = postTranslations;
