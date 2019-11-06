require("dotenv").config();

const defaultLanguages = require("./i18n/default-languages.json");
const { toPairs } = require("ramda");
const yargs = require("yargs");
const fs = require("fs");
const { translate } = require("./translate");

const argv = yargs
  .option("source", {
    alias: "s",
    description: "Source language for translation",
    type: "string"
  })
  .help()
  .alias("help", "h").argv;

// read configuration
// source language: en by default, read from CLI argv
// languages for landing: ['en', 'cs', 'es', 'de', 'fr', 'it', 'ru']
// languages for app and common: default languages (40)
// languages for dashboard and waiterboard: en, cs, es
const config = {
  sourceLanguage: argv.source || "en",
  namespaces: {
    app: defaultLanguages,
    common: defaultLanguages,
    landing: ["en", "cs", "es", "de", "fr", "it", "ru"],
    dashboard: ["en", "cs", "es"]
    // waiterboard: ["en", "cs", "es"]
  }
};

toPairs(config.namespaces)
  .filter(([ns]) => ns === "common") // TEST
  .forEach(([namespace, languages]) => {
    const input = require(`./i18n/messages/${config.sourceLanguage}/${namespace}.json`);
    languages
      .filter(l => l !== config.sourceLanguage)
      .filter(l => l === "hu") // TEST
      .forEach(language => {
        console.log(namespace, language);
        translate({
          input,
          target: language,
          source: config.sourceLanguage
        }).then(result => {
          console.log("result");
          console.log(result);
        });
      });
  });

// scan through files in src folder
// for each namespace
// for each language
// if file should exist according to config -> translate as new (also retranslate and overwrites)

// overwrite files in dist/i18n/messages

// copy packs from node_modules/@phensley/cldr/packs
// to dist/i18n/packs
