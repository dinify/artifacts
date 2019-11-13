const defaultLanguages = require("../i18n/supplemental/default-languages.json");

const config = {
  sourceLanguage: "en",
  namespaces: {
    landing: ["en", "cs", "es", "de", "fr", "it", "ru"],
    "core.app": defaultLanguages,
    "core.dashboard": ["en", "cs", "es"]
    // 'core.waiterboard': ["en", "cs", "es"]
  }
};

module.exports = config;
