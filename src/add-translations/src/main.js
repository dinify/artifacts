// @ts-nocheck
'use strict';

const authorizeClient = require('./google-auth');
const saveTranslations = require('./translation-strings');

// Load client secrets from a local file.
const translationStrings = async () => {
  const client = await authorizeClient();
  await saveTranslations(client);
  // return formated;
};

// TODO: 1. fetch sheet
// TODO: 3. format sheet, create jsons (first create keys, then assing to them)
// TODO: 2. create folders / files
// TODO: 4. save
// TODO: new service account

// TODO: FORMAT SHEET => all A values should specify location [APP, ...]

translationStrings();
