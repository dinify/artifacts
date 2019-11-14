// This script builds the artifacts to the dist folder.

// Required for Cloud Translation API
// sets GOOGLE_APPLICATION_CREDENTIALS
require("dotenv").config();
const cliProgress = require("cli-progress");
const { flatten, deflatten } = require("../lib/json");
const { fromPairs, toPairs, keys, values, pipe } = require("ramda");
const yargs = require("yargs");
const fs = require("fs");
const rimraf = require("rimraf");
const { translate } = require("../translate");
const config = require("./config");

const argv = yargs
  .option("source", {
    alias: "s",
    description: "Source language for translation",
    type: "string"
  })
  .help()
  .alias("help", "h").argv;

config.sourceLanguage = argv.source || "en";

const total = toPairs(config.namespaces)
  .map(([ns, { languages }]) => languages.length)
  .reduce((p, c) => p + c);
const progressBar = new cliProgress.Bar(
  {
    fps: 60,
    format: "Progress: [{bar}] {percentage}% | {value}/{total} | {currentPath}"
  },
  cliProgress.Presets.shades_classic
);
progressBar.start(total, 0);
let progressCounter = 0;

rimraf.sync("./dist/i18n/messages");

const tryMkdir = dir => {
  try {
    fs.mkdirSync(dir);
  } catch (e) {}
};

const diffArrays = (a, b) => ({
  left: a.filter(a_ => !b.includes(a_)),
  right: b.filter(b_ => !a.includes(b_))
});

const root = `.`; // relative to package root
tryMkdir(`${root}/dist`);
tryMkdir(`${root}/dist/i18n`);
tryMkdir(`${root}/dist/i18n/messages`);

toPairs(config.namespaces).forEach(([namespace, { languages, extras }]) => {
  let source = {};
  namespace.split(".").map(namespaceSegment => {
    const part = require(`../i18n/messages/${config.sourceLanguage}/${namespaceSegment}.json`);
    source = { ...source, ...part };
  });
  const flatSource = flatten(source);
  const schema = keys(flatSource);

  languages.forEach(async language => {
    let result = {};
    let existingTarget = {};
    namespace.split(".").map(namespaceSegment => {
      const targetFile = `${root}/src/i18n/messages/${language}/${namespaceSegment}.json`;
      if (fs.existsSync(targetFile)) {
        const flatTarget = pipe(
          fs.readFileSync,
          JSON.parse,
          flatten
        )(targetFile);
        existingTarget = { ...existingTarget, ...flatTarget };
      }
    });
    const existingSchema = keys(existingTarget);
    const diffResult = diffArrays(schema, existingSchema);
    // added
    if (diffResult.left.length > 0) {
      const input = toPairs(flatSource)
        .filter(([k]) => diffResult.left.includes(k))
        .map(([, v]) => v);
      const msg =
        existingSchema.length === input.length
          ? `all (${input.length})`
          : input.length;
      const translations = await translate({
        input,
        extras,
        target: language,
        source: config.sourceLanguage
      });
      progressBar.update(progressCounter, {
        currentPath: `Translating ${msg} messages for ${language} in ${namespace}`
      });
      translations.map((t, i) => {
        result[diffResult.left[i]] = t;
      });
    }
    // existing
    if (existingSchema.length > 0) {
      const filtered = toPairs(existingTarget).filter(
        ([k]) => !diffResult.right.includes(k)
      );
      progressBar.update(progressCounter, {
        currentPath: `Copying ${filtered.length} out of ${existingSchema.length} messages for ${language} in ${namespace}`
      });
      if (diffResult.right.length > 0) {
        progressBar.update(progressCounter, {
          currentPath: `Removing ${diffResult.right.length} out of ${existingSchema.length} messages for ${language} in ${namespace}`
        });
      }

      filtered.map(([k, v]) => {
        result[k] = v;
      });
    }

    const doubleCheck = diffArrays(schema, keys(result));
    if (doubleCheck.left.length > 0 || doubleCheck.right.length > 0) {
      // console.error(`Schema mismatch for ${language} in ${namespace}`);
      // console.error(doubleCheck);
      progressCounter++;
      progressBar.update(progressCounter, {
        currentPath: `Schema mismatch for ${language} in ${namespace}`
      });
    } else {
      const destPath = `${root}/dist/i18n/messages/${language}`;
      const destFile = `${destPath}/${namespace}`;
      // sort result for same order in schema
      result = fromPairs(
        toPairs(result).sort(([k], [k2]) => k.localeCompare(k2))
      );
      tryMkdir(destPath);
      fs.writeFileSync(destFile, JSON.stringify(values(result)));
      progressCounter++;
      progressBar.update(progressCounter, {
        currentPath: destFile
      });
    }
    if (progressCounter >= total) {
      progressBar.update(total, {
        currentPath: `done`
      });
      progressBar.stop();
      console.log("\n");
    }
  });
});
