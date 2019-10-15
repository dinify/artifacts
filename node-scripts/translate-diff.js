const fs = require('fs');
const { translate } = require('./translate');
const { flatten, deflatten } = require('./lib/json');

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const diff = (a1, a2) => {
  var a = [], diff = [];
  for (var i = 0; i < a1.length; i++) {
      a[a1[i]] = true;
  }
  for (var i = 0; i < a2.length; i++) {
      if (a[a2[i]]) {
          delete a[a2[i]];
      } else {
          a[a2[i]] = true;
      }
  }
  for (var k in a) {
      diff.push(k);
  }

  return diff;
}

const printHelp = () => {
  console.log(`
Usage: 

node translate-diff.js <namespace> <input-language> <output-language>

Computes the difference in the JSON keys of the output language to the input language.
  `);
};

if (process.argv.length <= 2) printHelp();
else {
  try {
    const namespace = process.argv[2];
    const fromL = process.argv[3];
    const toL = process.argv[4];
    const input = fs.readFileSync(`../i18n/translations/${fromL}/${namespace}.json`);
    const translationKeys = pipe(
      p => fs.readFileSync(p),
      f => f.toString(),
      JSON.parse,
      flatten,
      Object.keys
    );
    const keysA = translationKeys(`../i18n/translations/${fromL}/${namespace}.json`);
    const keysB = translationKeys(`../i18n/translations/${toL}/${namespace}.json`);
    const d = diff(keysA, keysB);
    if (d.length === 0) console.log('No difference');
    else {
      console.log('Translating ', d);
      translate({ input, target: 'cs', source: 'en', model: 'nmt' });
    }
  }
  catch (e) {
    console.log(e + '\n\n');
    printHelp();
  }
}
