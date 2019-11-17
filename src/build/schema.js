const { flatten, deflatten } = require("../lib/json");
const { keys, toPairs, fromPairs } = require("ramda");
const config = require("./config");
const fs = require("fs");
const rimraf = require("rimraf");

const tryMkdir = dir => {
  try {
    fs.mkdirSync(dir);
  } catch (e) {}
};

const root = `.`; // relative to package root
rimraf.sync("./dist/i18n/common");
tryMkdir(`${root}/dist/i18n/common`);

// export type MessageKey = "${schemaKeys.join('"|"')}";
// export interface Messages ${schemaString};

fs.writeFileSync(
  `${root}/dist/i18n/common/schemas.ts`,
  `
export type KeyedSchemas = {
  [namespace: string]: {
    schema: string[]
  }
};
const schemas: KeyedSchemas = {
  ${toPairs(config.namespaces)
    .map(([namespace, languages]) => {
      let source = {};
      namespace.split(".").map(namespaceSegment => {
        const part = require(`../i18n/messages/${config.sourceLanguage}/${namespaceSegment}`);
        source = { ...source, ...part };
      });
      const flatObject = fromPairs(
        toPairs(flatten(source)).sort(([k], [k2]) => k.localeCompare(k2))
      );
      const schemaKeys = keys(flatObject);
      return `"${namespace}": { schema: ${JSON.stringify(schemaKeys)} }`;
    })
    .join(",\n  ")}
};
export default schemas;`
);
