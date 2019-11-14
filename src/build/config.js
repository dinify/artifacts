const defaultLanguages = require("../i18n/supplemental/default-languages.json");

const test = false;
const constants = {
  plural: 2
};
const common = {
  sourceLanguage: "en",
  constants,
  namespaces: {
    "core.app": {
      extras: [
        {
          id: "en",
          matcher: msg => msg[0] === constants.plural,
          terms: ["empty", "item", "items"],
          message: (...p) =>
            `{count, plural, =0 {${p[0]}} one {# ${p[1]}} other {# ${p[2]}} }`
        }
      ]
    }
  }
};
const config = test
  ? {
      ...common,
      namespaces: {
        "core.app": {
          languages: ["en", "es", "hu"],
          ...common.namespaces["core.app"]
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
          languages: defaultLanguages,
          ...common.namespaces["core.app"]
        },
        "core.dashboard": {
          languages: ["en", "cs", "es"]
        }
        // 'core.waiterboard': { languages: ["en", "cs", "es"] }
      }
    };

module.exports = config;
