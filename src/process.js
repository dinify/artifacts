const csv = require("csvtojson");
const fs = require("fs");
const cliProgress = require("cli-progress");
const rimraf = require("rimraf");

const locales = [
  "af",
  "sq",
  "am",
  "ar",
  "hy",
  "az",
  "eu",
  "be",
  "bn",
  "bs",
  "bg",
  "ca",
  "ceb",
  "zh-CN",
  "zh-TW",
  "co",
  "hr",
  "cs",
  "da",
  "nl",
  "en",
  "eo",
  "et",
  "fi",
  "fr",
  "fy",
  "gl",
  "ka",
  "de",
  "el",
  "gu",
  "ht",
  "ha",
  "haw",
  "he",
  "hi",
  "hmn",
  "hu",
  "is",
  "ig",
  "id",
  "ga",
  "it",
  "ja",
  "jw",
  "kn",
  "kk",
  "km",
  "ko",
  "ku",
  "ky",
  "lo",
  "la",
  "lv",
  "lt",
  "lb",
  "mk",
  "mg",
  "ms",
  "ml",
  "mt",
  "mi",
  "mr",
  "mn",
  "my",
  "ne",
  "no",
  "ny",
  "ps",
  "fa",
  "pl",
  "pt",
  "pa",
  "ro",
  "ru",
  "sm",
  "gd",
  "sr",
  "st",
  "sn",
  "sd",
  "si",
  "sk",
  "sl",
  "so",
  "es",
  "su",
  "sw",
  "sv",
  "tl",
  "tg",
  "ta",
  "te",
  "th",
  "tr",
  "uk",
  "ur",
  "uz",
  "vi",
  "cy",
  "xh",
  "yi",
  "yo",
  "zu"
];

const replacements = {
  jw: "jv",
  no: "nb",
  tl: "fil",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
  zhCN: "zh-Hans",
  zhTW: "zh-Hant"
};

// JSON deflattener
const deflattenObject = paths => {
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
    } else {
      scope[current] = value;
    }
  };

  var result = {};

  // Iterate through the original list, spliting up each path
  // and passing it to our recursive processing function
  Object.keys(paths).forEach(path => {
    const value = paths[path];
    path = path.split(".");
    buildFromSegments(result, path, value);
  });

  return result;
};

const namespaces = ["app", "core"];
const exclude = ["en", "hu"];

// Progress bar
const total = namespaces.length + (locales.length - exclude.length) + 10;
const progressBar = new cliProgress.Bar(
  {
    fps: 60,
    format: "Progress: [{bar}] {percentage}% | {value}/{total} | {currentPath}"
  },
  cliProgress.Presets.shades_classic
);
progressBar.start(total, 0);
let progressCounter = 0;

rimraf.sync("./locales/*");
progressBar.update((progressCounter += 10));

const pause = milliseconds => {
  var dt = new Date();
  while (new Date() - dt <= milliseconds) {
    /* Do nothing */
  }
};

namespaces.forEach(namespace => {
  csv()
    .fromFile(`../${namespace}.csv`)
    .then(jsonObj => {
      /*
    { key: 'nutrition.calories',
      param: '',
      subs: '',
      rawString: 'Calories',
      withContext: 'Calories',
      af: 'kalorieë',
      sq: 'kalorive',
      am: 'ካሎሪዎች',
      ar: 'سعرات حراريه',
      hy: 'կալորիա',
      az: 'Kalori',
      ...
    }
    */

      locales.forEach(locale => {
        progressCounter += 1;

        if (!exclude.includes(locale)) {
          let result = {};
          jsonObj.forEach(entry => {
            let translation = entry[locale];

            // discard if translation matches withContext
            if (translation.toLowerCase() !== entry.withContext.toLowerCase()) {
              if (entry.subs) {
                // replace subs with param in translation

                if (!translation.includes(entry.subs))
                  console.warn(
                    "! not substituted",
                    entry.key,
                    locale,
                    "substitution: ",
                    entry.subs
                  );
                translation = translation.replace(entry.subs, entry.param);
              }

              // Capitalize first letter
              translation =
                translation.charAt(0).toUpperCase() + translation.slice(1);

              // Trim
              translation = translation.trim();

              result[entry.key] = translation;
            }
          });

          result = deflattenObject(result);

          let replaced = replacements[locale] || locale;

          try {
            fs.mkdirSync(`./locales/${replaced}`);
          } catch (e) {}

          fs.writeFileSync(
            `./locales/${replaced}/${namespace}.json`,
            JSON.stringify(result, null, 2)
          );

          progressBar.update(progressCounter, {
            currentPath: `${replaced}/${namespace}`
          });
        }
        pause(1);
      });

      progressBar.update(total, {
        currentPath: `done`
      });
      progressBar.stop();
    });
});
