const defaultLanguages = require("../i18n/supplemental/default-languages.json");

const test = false;
const constants = {
  plural: 2
};
const common = {
  sourceLanguage: "en",
  constants
};
const config = test
  ? {
      ...common,
      namespaces: {
        "core.app": {
          languages: ["en", "es"]
        }
      }
    }
  : {
      ...common,
      namespaces: {
        landing: {
          languages: ["en", "cs", "es", "de", "fr", "it", "ru"]
        },
        "core.app": {
          languages: defaultLanguages
        },
        "core.dashboard": {
          languages: ["en", "cs", "es"]
        }
        // 'core.waiterboard': { languages: ["en", "cs", "es"] }
      }
    };

module.exports = config;
