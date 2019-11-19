require("dotenv").config();
const yargs = require("yargs");
const fs = require("fs");
const { pipe, fromPairs } = require("ramda");
const { deflatten } = require("../lib/json");
const config = require("../build/config");

const argv = yargs
  .option("source", {
    alias: "s",
    description: "Source language for reference schema",
    type: "string"
  })
  .option("language", {
    alias: "l",
    description: "The language to include for maintainance",
    type: "string"
  })
  .option("namespace", {
    alias: "n",
    description: "The namespace to include, defaults to all",
    type: "string"
  })
  .option("keys", {
    alias: "k",
    description: "The list of keys to include, defaults to all",
    type: "array"
  })
  .option("write", {
    alias: "w",
    description: "Write the output to the default path in src",
    type: "boolean"
  })
  .option("output", {
    alias: "o",
    description: "The file path to write the output to",
    type: "string"
  })
  .help()
  .alias("help", "h").argv;

config.include = {
  language: argv.language,
  namespaces: [argv.namespace] || keys(config.namespaces),
  keys: argv.keys,
  output: argv.output
};
config.sourceLanguage = argv.source || "en";

function stringify(param) {
  if (typeof param === "string") {
    return param.includes("\n") ? `\`${param}\`` : JSON.stringify(param);
  } else if (typeof param !== "object" || Array.isArray(param)) {
    return JSON.stringify(param);
  }
  let props = Object.keys(param)
    .map(key => `${key}:${stringify(param[key])}`)
    .join(",\n  ");
  return `{\n  ${props}\n}`;
}

config.include.namespaces.forEach(ns => {
  const get = pipe(fs.readFileSync, JSON.parse);
  const source = get(`./dist/i18n/messages/${config.include.language}/${ns}`);
  const schema = get(`./dist/i18n/common/${ns}`);
  const k = config.include.keys || schema;
  const result = deflatten(
    fromPairs(
      schema.map((s, i) => [s, source[i]]).filter(([s]) => k.includes(s))
    )
  );
  const output =
    config.include.output ||
    `./src/i18n/messages/${config.include.language}/${ns}.js`;
  if (argv.write || config.include.output) {
    console.log("Writing result to", output);
    fs.writeFileSync(output, `module.exports = ${stringify(result)};`);
  } else {
    console.log(result);
  }
});
