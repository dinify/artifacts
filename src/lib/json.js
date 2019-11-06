const {
  __,
  curry,
  pipe,
  useWith,
  map,
  type,
  chain,
  toPairs,
  fromPairs,
  mergeWith,
  objOf,
  always,
  ifElse,
  apply,
  both,
  has,
  evolve,
  prop,
  groupBy,
  last,
  merge,
  cond,
  values,
  equals
} = require("ramda");

const flatten = obj => {
  let result = {};
  const flattenFunc = (obj, flattenedKey) => {
    var k;
    if (obj instanceof Object) {
      for (k in obj) {
        if (obj.hasOwnProperty(k)) {
          flattenFunc(obj[k], flattenedKey ? flattenedKey + "." + k : k);
        }
      }
    } else {
      let str = obj;
      result[flattenedKey] = obj;
    }
  };
  flattenFunc(obj);
  return result;
};

const deflatten = paths => {
  const buildFromSegments = (scope, pathSegments, value) => {
    const current = pathSegments.shift();
    const found = scope[current];
    if (!found) {
      scope[current] = {};
    }
    if (pathSegments.length) {
      buildFromSegments(scope[current], pathSegments, value);
    } else {
      scope[current] = value;
    }
  };
  var result = {};
  Object.keys(paths).forEach(path => {
    const value = paths[path];
    path = path.split(".");
    buildFromSegments(result, path, value);
  });

  return result;
};

// Source
// https://github.com/ramda/ramda/wiki/Cookbook#flatten-a-nested-object-into-dot-separated-key--value-pairs
const flattenObj = obj => {
  const go = obj_ =>
    chain(([k, v]) => {
      if (type(v) === "Object" || type(v) === "Array") {
        return map(([k_, v_]) => [`${k}.${k_}`, v_], go(v));
      } else {
        return [[k, v]];
      }
    }, toPairs(obj_));

  return fromPairs(go(obj));
};

// Source:
// https://github.com/ramda/ramda/wiki/Cookbook#diffobjs---diffing-objects-similar-to-guavas-mapsdifference
const groupObjBy = curry(
  pipe(
    // Call groupBy with the object as pairs, passing only the value to the key function
    useWith(groupBy, [useWith(__, [last]), toPairs]),
    map(fromPairs)
  )
);

// Source:
// https://github.com/ramda/ramda/wiki/Cookbook#diffobjs---diffing-objects-similar-to-guavas-mapsdifference
const diffObjs = pipe(
  useWith(mergeWith(merge), [
    map(objOf("leftValue")),
    map(objOf("rightValue"))
  ]),
  groupObjBy(
    cond([
      [
        both(has("leftValue"), has("rightValue")),
        pipe(
          values,
          ifElse(apply(equals), always("common"), always("difference"))
        )
      ],
      [has("leftValue"), always("onlyOnLeft")],
      [has("rightValue"), always("onlyOnRight")]
    ])
  ),
  evolve({
    common: map(prop("leftValue")),
    onlyOnLeft: map(prop("leftValue")),
    onlyOnRight: map(prop("rightValue"))
  })
);

module.exports.flattenObj = flattenObj;
module.exports.diffObjs = diffObjs;
module.exports.groupObjBy = groupObjBy;

module.exports.flatten = flatten;
module.exports.deflatten = deflatten;
