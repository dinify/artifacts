const fs = require("fs");
const { deflatten } = require("./lib/json");
// TEST
const language = "de";
const namespace = "landing";
const rawTest = JSON.parse(
  fs.readFileSync(`./dist/i18n/messages/${language}/${namespace}`)
);
const rawSchema = JSON.parse(
  fs.readFileSync(`./dist/i18n/schemas/${namespace}`)
);

const parse = (raw, schema) => {
  let result = {};
  schema.map((k, i) => {
    result[k] = raw[i];
  });
  return deflatten(result);
};

console.log(parse(rawTest, rawSchema));
