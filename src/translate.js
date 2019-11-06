const fetch = require("node-fetch");
const { flatten, deflatten } = require("./lib/json");
const { TranslationServiceClient } = require("@google-cloud/translate");

const projectId = "dinify";
const location = "global";
const translationClient = new TranslationServiceClient();

const levenshteinDistance = (a, b) => {
  const distanceMatrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) {
    distanceMatrix[0][i] = i;
  }
  for (let j = 0; j <= b.length; j += 1) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1, // deletion
        distanceMatrix[j - 1][i] + 1, // insertion
        distanceMatrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return distanceMatrix[b.length][a.length];
};

const jaroWinklerSimilarity = (s1, s2, options) => {
  const extend = (a, b) => {
    for (var property in b) {
      if (b.hasOwnProperty(property)) {
        a[property] = b[property];
      }
    }
    return a;
  };

  var m = 0;
  var defaults = { caseSensitive: true };
  var settings = extend(defaults, options);
  var i;
  var j;
  if (s1.length === 0 || s2.length === 0) {
    return 0;
  }
  if (!settings.caseSensitive) {
    s1 = s1.toUpperCase();
    s2 = s2.toUpperCase();
  }
  if (s1 === s2) {
    return 1;
  }
  var range = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  var s1Matches = new Array(s1.length);
  var s2Matches = new Array(s2.length);
  for (i = 0; i < s1.length; i++) {
    var low = i >= range ? i - range : 0;
    var high = i + range <= s2.length - 1 ? i + range : s2.length - 1;

    for (j = low; j <= high; j++) {
      if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
        ++m;
        s1Matches[i] = s2Matches[j] = true;
        break;
      }
    }
  }
  if (m === 0) {
    return 0;
  }
  var k = 0;
  var numTrans = 0;
  for (i = 0; i < s1.length; i++) {
    if (s1Matches[i] === true) {
      for (j = k; j < s2.length; j++) {
        if (s2Matches[j] === true) {
          k = j + 1;
          break;
        }
      }

      if (s1[i] !== s2[j]) {
        ++numTrans;
      }
    }
  }

  var weight = (m / s1.length + m / s2.length + (m - numTrans / 2) / m) / 3;
  var l = 0;
  var p = 0.1;
  if (weight > 0.7) {
    while (s1[l] === s2[l] && l < 4) {
      ++l;
    }
    weight = weight + l * p * (1 - weight);
  }
  return weight;
};

const translate = ({ input, target, source, model = "nmt" }) => {
  let translateArr = input.map(value => {
    return value
      .replace("{{", '<span translate="no">')
      .replace("}}", "</span>");
  });

  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    model: `projects/${projectId}/locations/${location}/models/general/nmt`,
    contents: translateArr,
    mimeType: "text/html",
    sourceLanguageCode: source,
    targetLanguageCode: target
  };

  // console.log(url);
  return translationClient
    .translateText(request)
    .then(responses => {
      return responses[0];
    })
    .then(json => {
      if (!json.error) {
        let flatResult = [];
        json.translations.forEach((translation, index) => {
          const format = str => {
            while (str.includes('<span translate="no">')) {
              str = str
                .replace('<span translate="no">', "{{")
                .replace("</span>", "}}");
            }
            if (str.split("{{count, number}}").length === 3) {
              const arr = str.split("{{count, number}}");
              str = `${arr[0]}{{count, number}}${arr[1]}`;
            }
            return str;
          };
          const firstUpperCase = str =>
            str.charAt(0).toUpperCase() + str.slice(1);

          let replaced = format(translation.translatedText);
          replaced = replaced.replace("&#39;", "'");
          const firstChar = input[index].charAt(0);
          const upperCase = firstChar == firstChar.toUpperCase();
          flatResult[index] = upperCase ? firstUpperCase(replaced) : replaced;
        });
        return flatResult;
      } else {
        console.log(JSON.stringify(json, null, 2));
        return null;
      }
    })
    .catch(error => console.error(error));
};

let qualityCheck = ({ original, translated, source, target = "en" }) => {
  const flat = flatten(original);
  return translate({
    input: translated,
    source,
    target
  }).then(result => {
    const flatResult = {};
    Object.entries(flatten(result)).forEach(([key, translated]) => {
      const original = flat[key].replace(/{{.+}}/g, "");
      const trans = translated.replace(/{{.+}}/g, "");
      const similarity = jaroWinklerSimilarity(original, translated);
      flatResult[key] = Math.floor(similarity * 1000) / 1000;
    });
    return deflatten(flatResult);
  });
};

let formatPercent = json => {
  const flatResult = {};
  Object.entries(flatten(json)).forEach(([key, quality]) => {
    flatResult[key] = new Intl.NumberFormat("en-US", {
      style: "percent"
    }).format(quality);
  });
  return deflatten(flatResult);
};

let averagePercent = json => {
  let result = 0;
  let total = 0;
  Object.entries(flatten(json)).forEach(([key, quality]) => {
    result += quality;
    total += 1;
  });
  return new Intl.NumberFormat("en-US", { style: "percent" }).format(
    result / total
  );
};

let filterQuality = (json, max = 0.5, org = null) => {
  const flatResult = {};
  const orgFlat = org ? flatten(org) : null;
  Object.entries(flatten(json)).forEach(([key, quality]) => {
    if (quality <= max) {
      if (orgFlat) flatResult[key] = orgFlat[key];
      else flatResult[key] = quality;
    }
  });
  return deflatten(flatResult);
};

module.exports.translate = translate;
