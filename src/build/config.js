const defaultLanguages = require("../i18n/supplemental/default-languages.json");

const managedLanguages = ["en", "cs", "es", "fr", "it", "de", "ru", "zh-Hans", "ko"];

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
        core: managedLanguages,
        "core.app": defaultLanguages,
        "core.dashboard": managedLanguages,
        "core.waiterboard": managedLanguages
      }
    };

module.exports = config;
