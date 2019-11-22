const { flatten } = require("../lib/json");
const { toPairs, fromPairs } = require("ramda");

const namespaces = ["app", "core", "waiterboard", "dashboard"];
namespaces.forEach(ns => {
  const input = require(`../i18n/messages/en/${ns}`);
  const output = toPairs(flatten(input))
    .sort(([k], [k2]) => k.localeCompare(k2))
    .map(([k, v]) => `${k}\t="${v.split("\n").join('"&char(10)&"')}"`)
    .join("\n");
  console.log(ns);
  console.log(output);
});
