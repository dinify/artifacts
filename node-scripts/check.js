var fs = require('fs');
var path = require('path');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

// JSON flattener
const flatten = (obj) => {
  let result = {};
  const flattenFunc = (obj, flattenedKey) => {
    var k;
    if (obj instanceof Object) {
      for (k in obj) {
        if (obj.hasOwnProperty(k)){
          //recursive call to scan property
          flattenFunc(obj[k], flattenedKey ? (flattenedKey + '.' + k) : k);
        }
      }
    } else {
    	let str = obj;
      result[flattenedKey] = obj;
    };

  };
  flattenFunc(obj);
  return result;
};

// JSON deflattener
const deflattenObject = (paths) => {

    // Processes each path recursively, one segment at a time
    const buildFromSegments = (scope, pathSegments, value) => {
        // Remove the first segment from the path
        const current = pathSegments.shift();

        // See if that segment already exists in the current scope
        const found = scope[current];
        if (!found) {
            scope[current] = {};
        }

        if (pathSegments.length) {
            buildFromSegments(scope[current], pathSegments, value);
        }
        else {
            scope[current] = value;
        }
    }

    var result = { };

    // Iterate through the original list, spliting up each path
    // and passing it to our recursive processing function
    Object.keys(paths).forEach((path) => {
        const value = paths[path];
        path = path.split('.');
        buildFromSegments(result, path, value);
    });

    return result;
}

walk('./cldr-data', function(err, results) {
  if (err) throw err;
  results.forEach((file, i) => {
    if (file.includes('ca-gregorian')) {
      const arr = file.split('/');
      const data = JSON.parse(fs.readFileSync(file));
      const locale = arr[arr.length - 2];
      const intervalFormats = data.main[locale].dates.calendars.gregorian.dateTimeFormats.intervalFormats;
      const interval = intervalFormats.hm.m;
      const interval2 = intervalFormats.h.h;
      const splitChar = intervalFormats.intervalFormatFallback.replace('{0}', '').replace('{1}', '').trim();

      const possibleSplitChars = ['–', '-', '\'a\'', 'تا', '～', '~', '至'];

      const columns = [];
      columns.push(locale);
      columns.push(intervalFormats.intervalFormatFallback);
      columns.push(splitChar);

      columns.push(intervalFormats.hm.m);
      let includes = false;
      let actualSplitChar = false;
      possibleSplitChars.forEach(char => {
        const found = intervalFormats.hm.m.includes(char);
        includes = includes || found;
        if (found) actualSplitChar = char;
      });
      columns.push(includes);
      columns.push(actualSplitChar);

      includes = false;
      columns.push(intervalFormats.Hm.m);
      possibleSplitChars.forEach(char => {
        const found = intervalFormats.Hm.m.includes(char);
        includes = includes || found;
        if (found) actualSplitChar = char;
      });
      columns.push(includes);
      columns.push(actualSplitChar);

      const output = [];
      columns.forEach(col => {
        output.push(col);
        output.push('\t');
      });
      console.log(...output);
    }
  })
});
