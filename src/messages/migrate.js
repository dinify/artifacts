require("dotenv").config();
const yargs = require("yargs");
const fs = require("fs");
const { pipe, toPairs, fromPairs, keys, values } = require("ramda");
const { deflatten, flatten } = require("../lib/json");
const { stringify } = require("../lib/es6");
const config = require("../build/config");
const cfg = require("./migration-1");

const argv = yargs
  .option("language", {
    alias: "l",
    description: "The language to migrate, defaults to all",
    type: "string"
  })
  .option("keys", {
    alias: "k",
    description: "The list of keys in the namespace to migrate to core",
    type: "array"
  })
  .option("write", {
    alias: "w",
    description: "Write the output to the default path in src",
    type: "boolean"
  })
  .option("output", {
    alias: "o",
    description: "The output directory",
    type: "string"
  })
  .help()
  .alias("help", "h").argv;

config.include = {
  languages: argv.language ? [argv.language] : config.namespaces.core,
  keys: argv.keys,
  output: argv.output
};
config.sourceLanguage = argv.source || "en";
keys(cfg).forEach(ns => {
  console.log(`Migrating languages for ${ns}: `, config.include.languages);
  config.include.languages.forEach(language => {
    const core = require(`../i18n/messages/${language}/core`);
    const source = require(`../i18n/messages/${language}/${ns}`);
    const sourceKeys = keys(cfg[ns]);
    const resultKeys = values(cfg[ns]);
    const add = toPairs(flatten(source))
      .filter(([k, v]) => sourceKeys.includes(k))
      .map(([k, v]) => [resultKeys[sourceKeys.findIndex(a => a === k)], v]);
    const keep = deflatten(
      fromPairs(
        toPairs(flatten(source)).filter(([k, v]) => !sourceKeys.includes(k))
      )
    );
    const result = deflatten(fromPairs([...add, ...toPairs(flatten(core))]));
    const output = config.include.output || `./src/i18n/messages`;
    if (argv.write || config.include.output) {
      console.log("Appending keys to", `${output}/${language}/core.js`);
      console.log("Removing keys from", `${output}/${language}/${ns}.js`);
      fs.writeFileSync(`${output}/${language}/core.js`, stringify(result));
      fs.writeFileSync(`${output}/${language}/${ns}.js`, stringify(keep));
    } else {
      console.log(add);
    }
  });
});
