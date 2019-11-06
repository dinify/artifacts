"use strict";

var fs = _interopRequireWildcard(require("fs"));

var _googleAuth = require("./google-auth");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// @ts-nocheck
var _require = require('googleapis'),
    google = _require.google;

var request = require('request');

var TRANSLATION_API = 'http://localhost:3000/translations/addForLanguage'; // const SPREADHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';

var SPREADHEET_ID = '1ah2DrY3s66tdGYQ5gRhlEf0qptUC9CfIK_6VccC54_Y';
var RANGE = 'Sheet7!A1:C';
var OVERWRITE = true; // If modifying these scopes, delete token.json.
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
// Load client secrets from a local file.

fs.readFile('credentials.json', function (err, content) {
  if (err) return console.log('Error loading client secret file:', err); // Authorize a client with credentials, then call the Google Sheets API.

  (0, _googleAuth.authorize)(JSON.parse(content), postTranslations);
});
/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */

function postTranslations(auth) {
  var sheets = google.sheets({
    version: 'v4',
    auth: auth
  });
  sheets.spreadsheets.values.get({
    spreadsheetId: SPREADHEET_ID,
    range: RANGE
  }, function (err, res) {
    if (err) return console.log('The API returned an error: ' + err);
    var rows = res.data.values;
    var body = buildBody(rows);
    console.log(JSON.stringify(body, null, 2));
    post(body);
  });
}

function buildBody(sheet) {
  var column = 2;
  var body = {
    language: '',
    overwrite: OVERWRITE,
    translations: []
  };

  if (!sheet.length) {
    console.error('No data found.');
  }

  sheet.map(function (row, i) {
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
 *
 * @param {*} body
 */


function post(body) {
  request.post(TRANSLATION_API, {
    json: body
  }, function (err, res) {
    if (err) throw new Error('Request error!');
    console.log(JSON.stringify(res.body, null, 2));
  });
} // todo: fetch actual translations sheet
// todo: do multiple requests
// todo: pass lang, sheet and range from cmd