// @ts-nocheck
'use strict';

const authorizeClient = require('./google-auth');
const saveTranslations = require('./translation-strings');

// Load client secrets from a local file.
const translationStrings = async () => {
  const client = await authorizeClient();
  const res = await saveTranslations(client);
};

translationStrings();
