const { fromPairs, toPairs } = require('ramda');
const typefaces = require("./typefaces");

const systemStack = {
  'system-ui': 'SF Pro Text',
  '-apple-system': 'SF Pro Display',
  'Segoe UI': 'Segoe UI',
  'Roboto': 'Roboto',
  'Helvetica Neue': 'Helvetica Neue',
  'Arial': 'Arial',
  'Noto Sans': 'Noto Sans',
  'sans-serif': 'Arial',
  'Apple Color Emoji': 'SF Pro Text',
  'Segoe UI Emoji': 'Segoe UI',
  'Segoe UI Symbol': 'Segoe UI',
  'Noto Color Emoji': 'Noto Sans',
};

console.log(fromPairs(toPairs(systemStack).map(([k, v]) => {
  console.log(v);
  const metrics = typefaces[v][400]();
  const result = metrics.xHeight / metrics.unitsPerEm;
  return [k, result];
})));