const { flatten, deflatten } = require("../lib/json");
const { keys, toPairs } = require("ramda");
const config = require("./config");
const fs = require("fs");
const rimraf = require("rimraf");

const tryMkdir = dir => {
  try {
    fs.mkdirSync(dir);
  } catch (e) {}
};

const root = `.`; // relative to package root
rimraf.sync("./dist/i18n/modules");
tryMkdir(`${root}/dist/i18n/modules`);

const writeSchema = (object, namespace) => {
  const flatObject = flatten(object);
  const flatTypedef = {};
  toPairs(flatObject).forEach(([k, v]) => {
    flatTypedef[k] = "string";
  });
  const schemaKeys = keys(flatObject);

  let schemaString = JSON.stringify(deflatten(flatTypedef), null, 2);
  while (schemaString.includes('"string"'))
    schemaString = schemaString.replace('"string"', "string");

  tryMkdir(`${root}/dist/i18n/modules/${namespace}`);
  fs.writeFileSync(
    `${root}/dist/i18n/modules/${namespace}/messages.ts`,
    `
export const schema: MessageKey[] = ${JSON.stringify(schemaKeys)};
export type MessageKey = "${schemaKeys.join('"|"')}";
export interface Messages ${schemaString};
`
  );
};

toPairs(config.namespaces).forEach(([namespace, languages]) => {
  let source = {};
  namespace.split(".").map(namespaceSegment => {
    const part = require(`../i18n/messages/${config.sourceLanguage}/${namespaceSegment}.json`);
    source = { ...source, ...part };
  });
  writeSchema(source, namespace);
});
