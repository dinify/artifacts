const { toPairs, keys } = require('ramda');
const { diffArrays, flatten } = require("../lib/json");
const config = require("./config");

toPairs(config.namespaces).forEach(([namespace, languages]) => {
  namespace = namespace.split(".")[namespace.split(".").length - 1];
  languages.forEach(language => {
    let sourceSchema, targetSchema;
    try {
      const sourceFile = require(`../i18n/messages/${language}/${namespace}`);
      const targetFile = require(`../add-translations/translations/${language}/${namespace}`);
      sourceSchema = keys(flatten(sourceFile));
      targetSchema = keys(flatten(targetFile));
      const { left: added, right: removed } = diffArrays(targetSchema, sourceSchema);
      console.log(`${namespace}.${language}\t`, 'added\t', added, '\tremoved\t', removed);
    } catch (e) {
      // console.log(e);
    }
  });
});
