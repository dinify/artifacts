// @ts-nocheck
'use strict';

const authorizeClient = require('./google-auth');
const saveTranslations = require('./translation-strings');

// Load client secrets from a local file.
const translationStrings = async () => {
  const client = await authorizeClient();
  const formated = await saveTranslations(client);
  // return formated;
};

// TODO: new service account
// TODO: 1. fetch sheet
// TODO: 2. create folders
// TODO: 3. format sheet, create jsons (first create keys, then assing to them)
// TODO: 4. save

translationStrings();
