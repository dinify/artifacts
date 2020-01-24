require("dotenv").config();
const yargs = require("yargs");
const fs = require("fs");
const { pipe, toPairs, fromPairs } = require("ramda");
const { deflatten, flatten } = require("../lib/json");
const { stringify } = require("../lib/es6");
const config = require("../build/config");

const argv = yargs
  .option("language", {
    alias: "l",
    description: "The language to migrate, defaults to all",
    type: "string"
  })
  .option("namespace", {
    alias: "n",
    description: "The namespace to migrate to core",
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
  namespaces: [argv.namespace],
  keys: argv.keys,
  output: argv.output
};
config.sourceLanguage = argv.source || "en";

config.include.namespaces.forEach(ns => {
  console.log("Migrating languages: ", config.include.languages);
  config.include.languages.forEach(language => {
    const core = require(`../i18n/messages/${language}/core`);
    const source = require(`../i18n/messages/${language}/${ns}`);
    const keys = config.include.keys || schema;
    const add = toPairs(flatten(source)).filter(([k, v]) => keys.includes(k));
    const keep = deflatten(
      fromPairs(toPairs(flatten(source)).filter(([k, v]) => !keys.includes(k)))
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
