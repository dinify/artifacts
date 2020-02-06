// @ts-nocheck
'use strict';

const authorizeClient = require('./google-auth');
// const saveTranslations = require('./translation-strings');
const postTranslations = require('./ingredients-translations');

// Load client secrets from a local file.
// const translationStrings = async () => {
//   const client = await authorizeClient();
//   const res = await saveTranslations(client);
// };

const ingredientTranslations = async () => {
  const client = await authorizeClient();
  const res = postTranslations(client);
};

// translationStrings();
ingredientTranslations();
