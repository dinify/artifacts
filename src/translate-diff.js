const fs = require("fs");
// const { translate } = require('./translate');
const {
  keys,
  pipe,
  dissocPath,
  path,
  assocPath,
  sort,
  comparator,
  lt
} = require("ramda");
const { flattenObj, deflatten } = require("./lib/json");
const defaultLanguages = require("../i18n/default-languages.json");

const printHelp = () => {
  console.log(`
Usage: 

node translate-diff.js <namespace> <input-language> <output-language|default>

Computes the difference in the JSON keys of the output language to the input language.
  `);
};

if (process.argv.length <= 2) printHelp();
else {
  try {
    const namespace = process.argv[2];
    const fromL = process.argv[3];
    const toL = process.argv[4];
    const jsonFile = pipe(
      l => `../i18n/translations/${l}/${namespace}.json`,
      fs.readFileSync,
      f => f.toString(),
      JSON.parse
    );
    const translationKeys = pipe(
      flattenObj,
      keys
      // k => sort(comparator(lt), k)
    );
    const diffArrays = (a, b) => ({
      left: a.filter(a_ => !b.includes(a_)),
      right: b.filter(b_ => !a.includes(b_))
    });
    const source = jsonFile(fromL);
    const keysA = translationKeys(source);
    const targetLanguages = toL === "default" ? defaultLanguages : [toL];
    targetLanguages.map(targetLang => {
      const original = jsonFile(targetLang);
      const keysB = translationKeys(original);
      const diffKeys = diffArrays(keysA, keysB);
      const added = diffKeys.left.length !== 0;
      const removed = diffKeys.right.length !== 0;
      if (!added && !removed) console.log("No difference");
      else {
        let processed = original;
        if (removed) {
          console.log(
            `Removed ${diffKeys.right.length} messages: `,
            diffKeys.right
          );
          diffKeys.right.forEach(k => {
            processed = dissocPath(k.split("."), processed);
          });
        } else console.log("No messages were removed");
        if (added) {
          console.log(
            `Translating ${diffKeys.left.length} new messages: `,
            diffKeys.left
          );
          let input = {};
          diffKeys.left.forEach(k => {
            input[k] = path(k.split("."), source);
          });
          console.log(input);
        } else console.log("No new messages were translated");
      }
      // else {
      //   console.log("Translating ", d.length);
      //   console.log(d);
      //   const diffInput = {};
      // d.map(key => [key, getIn(source, key)])
      //   .filter(([key, val]) => val !== undefined)
      //   .forEach(([key, val]) => setIn(diffInput, key, val));
      // translate({ input: diffInput, target: toL, source: fromL, model: 'nmt' }).then(result => {
      //   Object.keys(flatten(result)).map(key => [key, getIn(result, key)])
      //     .forEach(([key, val]) => setIn(original, key, val));

      //   fs.writeFileSync(`../i18n/translations/${toL}/${namespace}.json`, JSON.stringify(original, null, 2));
      //   console.log(`i18n/translations/${toL}/${namespace}.json`);
      // });
      // }
    });
  } catch (e) {
    console.log(e + "\n\n");
    printHelp();
  }
}
