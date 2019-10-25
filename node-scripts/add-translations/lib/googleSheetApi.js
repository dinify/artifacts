"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authorize = authorize;

var readline = _interopRequireWildcard(require("readline"));

var fs = _interopRequireWildcard(require("fs"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// @ts-nocheck
var TOKEN_PATH = 'token.json';
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

var _require = require('googleapis'),
    google = _require.google;
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */


function authorize(credentials, callback) {
  var _credentials$installe = credentials.installed,
      client_secret = _credentials$installe.client_secret,
      client_id = _credentials$installe.client_id,
      redirect_uris = _credentials$installe.redirect_uris;
  var oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]); // Check if we have previously stored a token.

  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */


function getNewToken(oAuth2Client, callback) {
  var authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oAuth2Client.getToken(code, function (err, token) {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token); // Store the token to disk for later program executions

      fs.writeFile(TOKEN_PATH, JSON.stringify(token), function (err) {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}