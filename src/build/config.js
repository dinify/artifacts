const defaultLanguages = require("../i18n/supplemental/default-languages.json");

const test = false;
const common = {
  sourceLanguage: "en"
};
const config = test
  ? {
      ...common,
      namespaces: {
        "core.app": ["en", "es"]
      }
    }
  : {
      ...common,
      namespaces: {
        landing: ["en", "cs", "es", "de", "fr", "it", "ru"],
        core: ["en", "cs", "es"],
        "core.app": defaultLanguages,
        "core.dashboard": ["en", "cs", "es"]
        // 'core.waiterboard': { languages: ["en", "cs", "es"] }
      }
    };

module.exports = config;
