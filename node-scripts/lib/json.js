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

module.exports.flatten = flatten;
module.exports.deflatten = deflatten;
