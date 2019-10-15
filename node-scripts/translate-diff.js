const fs = require('fs');
const { translate } = require('./translate');
const { flatten, deflatten } = require('./lib/json');

const getProp = ( object, keys, defaultVal ) => {
  keys = Array.isArray( keys )? keys : keys.split('.');
  object = object[keys[0]];
  if( object && keys.length>1 ){
    return getProp( object, keys.slice(1) );
  }
  return object === undefined? defaultVal : object;
}

const getIn = (object, keys, defaultVal) => {
  keys = Array.isArray( keys )? keys : keys.split('.');
  object = object[keys[0]];
  if( object && keys.length>1 ){
    return getProp( object, keys.slice(1) );
  }
  return object === undefined? defaultVal : object;
}
const setIn = (obj, path, value) => {
  var schema = obj;  // a moving reference to internal objects within obj
  var pList = path.split('.');
  var len = pList.length;
  for(var i = 0; i < len-1; i++) {
      var elem = pList[i];
      if( !schema[elem] ) schema[elem] = {}
      schema = schema[elem];
  }

  schema[pList[len-1]] = value;
}

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
    const jsonFile = pipe(
      l => `../i18n/translations/${l}/${namespace}.json`,
      p => fs.readFileSync(p),
      f => f.toString(),
      JSON.parse
    );
    const translationKeys = pipe(
      p => jsonFile(p),
      flatten,
      Object.keys
    );
    const source = jsonFile(fromL);
    const original = jsonFile(toL);
    const keysA = translationKeys(fromL);
    const keysB = translationKeys(toL);
    const d = diff(keysA, keysB);
    if (d.length === 0) console.log('No difference');
    else {
      console.log('Translating ', d.length);
      const diffInput = {};
      d.map(key => [key, getIn(source, key)])
        .filter(([key, val]) => val !== undefined)
        .forEach(([key, val]) => setIn(diffInput, key, val));
      translate({ input: diffInput, target: toL, source: fromL, model: 'nmt' }).then(result => {
        Object.keys(flatten(result)).map(key => [key, getIn(result, key)])
          .forEach(([key, val]) => setIn(original, key, val));

        fs.writeFileSync(`../i18n/translations/${toL}/${namespace}.json`, JSON.stringify(original, null, 2));
        console.log(`i18n/translations/${toL}/${namespace}.json`);
      });
    }
  }
  catch (e) {
    console.log(e + '\n\n');
    printHelp();
  }
}
