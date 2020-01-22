//@ts-nocheck
'use strict';

const { google } = require('googleapis');
const path = require('path');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

/**
 * Authorize Google Auth client using provided service-account.json file.
 *
 * @returns authorized client
 */
const authorizeClient = async () => {
  const client = new google.auth.JWT({
    keyFile: path.join(__dirname, './service-account.json'),
    scopes: SCOPES
  });
  return new Promise((resolve, reject) => {
    client.authorize((err, credentials) => {
      if (err) {
        reject(err);
      }
      client.setCredentials(credentials);
      resolve(client);
    });
  });
};

module.exports = authorizeClient;
