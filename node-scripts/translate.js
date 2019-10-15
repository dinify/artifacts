const fetch = require('node-fetch');
const fs = require('fs');
const languages = require('../i18n/default-languages.json');
const englishStrings = {
  app: require('../i18n/translations/en/app.json'),
  common: require('../i18n/translations/en/common.json'),
  dashboard: require('../i18n/translations/en/dashboard.json'),
  landing: require('../i18n/translations/en/landing.json'),
};
const { flatten, deflatten } = require('./lib/json');

const includeLanguages = ['cs'];
const excludeLanguages = [];
const namespaces = ['app', 'common']; //, 'dashboard', 'landing'];

const levenshteinDistance = (a, b) => {
	const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
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
				distanceMatrix[j - 1][i - 1] + indicator, // substitution
			);
		}
	}

	return distanceMatrix[b.length][a.length];
}

const jaroWinklerSimilarity = (s1, s2, options) => {
	const extend = (a, b) => {
    for (var property in b) {
      if (b.hasOwnProperty(property)) {
        a[property] = b[property];
      }
    }
    return a;
  }

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
  var range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
  var s1Matches = new Array(s1.length);
  var s2Matches = new Array(s2.length);
  for (i = 0; i < s1.length; i++) {
    var low  = (i >= range) ? i - range : 0;
    var high = (i + range <= (s2.length - 1)) ? (i + range) : (s2.length - 1);

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

  var weight = (m / s1.length + m / s2.length + (m - (numTrans / 2)) / m) / 3;
  var l = 0;
  var p = 0.1;
  if (weight > 0.7) {
    while (s1[l] === s2[l] && l < 4) {
      ++l;
    }
    weight = weight + l * p * (1 - weight);
  }
  return weight;
}

export const translate = ({input, target, source, model='nmt'}) => {
	let flat = flatten(input);
	let translateArr = Object.values(flat).map(value => {
	  return value.replace('{{', '<span translate="no">').replace('}}', '</span>');
	});

  const root = 'https://translation.googleapis.com/language/translate/v2';
  const apiKey = 'AIzaSyAjGSwsYJLbgjGqrt8DRQQFLi-ITjNS5L8';
  
	let qs = translateArr.map(elem => `q=${encodeURIComponent(elem)}`).join('&');
  let specifiedSource = source ? `&source=${source}` : '';
  const url = `${root}?${qs}&target=${target}&format=html&model=${model}${specifiedSource}&key=${apiKey}`;
  // console.log(url);
  return fetch(url)
			.then(response => response.json())
			.then(json => {
        // console.log(json.data);
				let flatResult = {};
				json.data.translations.forEach((translation, index) => {
					const currentKey = Object.keys(flat)[index];
          const splitCurrentKey = currentKey.split('.');
          const format = str => {
            while (str.includes('<span translate="no">')) {
              str = str.replace('<span translate="no">', '{{').replace('</span>', '}}');
						}
						if (str.split('{{count, number}}').length === 3) {
							const arr = str.split('{{count, number}}');
							str = `${arr[0]}{{count, number}}${arr[1]}`;
						}
            return str.toLowerCase();
          };
          const firstUpperCase = str => str.charAt(0).toUpperCase() + str.slice(1);
					if (splitCurrentKey[splitCurrentKey.length - 1] === '$text') {
						let found = null;
						json.data.translations.forEach((translationInner, indexInner) => {
							const splitCurrentKeyInner = Object.keys(flat)[indexInner].split('.');
							if (splitCurrentKeyInner[splitCurrentKeyInner.length - 1] === '$context') found = indexInner;
						});
						let foundYield = null;
						json.data.translations.forEach((translationInner, indexInner) => {
							const splitCurrentKeyInner = Object.keys(flat)[indexInner].split('.');
							if (splitCurrentKeyInner[splitCurrentKeyInner.length - 1] === '$yield') foundYield = indexInner;
            });
						if (found !== null) {
							const $text = translation.translatedText;
							const $context = format(json.data.translations[found].translatedText);
							let $yield = null;
							if (foundYield !== null) $yield = format(json.data.translations[foundYield].translatedText);

							let transformed = $text.replace($context, '').trim();
							if ($yield !== transformed && $text.split(' ').includes($yield)) transformed = $yield;

							splitCurrentKey.pop();
							const actualKey = splitCurrentKey.join('.');
							flatResult[actualKey] = firstUpperCase(transformed);
						}
					}
					else if (!(['$text', '$context', '$yield'].includes(splitCurrentKey[splitCurrentKey.length - 1]))) {
						let replaced = format(translation.translatedText);
						replaced = replaced.replace('&#39;', '\'');
						const firstChar = flat[currentKey].charAt(0);
						const upperCase = firstChar == firstChar.toUpperCase();
						flatResult[currentKey] = upperCase ? firstUpperCase(replaced) : replaced;
					}
				});
				return deflatten(flatResult);
      })
      .catch(error => console.error(error));
}

let qualityCheck = ({original, translated, source, target='en'}) => {
	const flat = flatten(original);
	return translate({
		input: translated,
		source,
		target
	}).then(result => {
		const flatResult = {};
		Object.entries(flatten(result)).forEach(([key, translated]) => {
			const original = flat[key].replace(/{{.+}}/g, '');
			const trans = translated.replace(/{{.+}}/g, '');
			const similarity = jaroWinklerSimilarity(original, translated);
			flatResult[key] = Math.floor(similarity * 1000) / 1000;
		});
		return deflatten(flatResult);
	});
}

let formatPercent = (json) => {
	const flatResult = {};
	Object.entries(flatten(json)).forEach(([key, quality]) => {
		flatResult[key] = new Intl.NumberFormat('en-US', { style: 'percent'}).format(quality);
	})
	return deflatten(flatResult);
}

let averagePercent = (json) => {
	let result = 0;
	let total = 0;
	Object.entries(flatten(json)).forEach(([key, quality]) => {
		result += quality;
		total += 1;
	})
	return new Intl.NumberFormat('en-US', { style: 'percent'}).format(result / total);
}

let filterQuality = (json, max = 0.5, org = null) => {
	const flatResult = {};
	const orgFlat = org ? flatten(org) : null;
	Object.entries(flatten(json)).forEach(([key, quality]) => {
		if (quality <= max) {
			if (orgFlat) flatResult[key] = orgFlat[key];
			else flatResult[key] = quality;
		}
	})
	return deflatten(flatResult);
}

// let language = 'hu';
// let namespace = 'app';

namespaces.forEach(namespace => {
	languages
		.filter(l => includeLanguages.length > 0 ? includeLanguages.includes(l) : true)
		.filter(l => !excludeLanguages.includes(l))
		.forEach(language => {
			translate({
				input: englishStrings[namespace],
				target: language
			}).then(result => {
				const r = '../i18n/translations';
				try {
					fs.mkdirSync(`${r}/${language}`);
				}
				catch (e) {}
		
				fs.writeFileSync(`${r}/${language}/${namespace}.json`, JSON.stringify(result, null, 2));
				console.log(`${r}/${language}/${namespace}.json`);
				// qualityCheck({
				//   original: app,
				//   translated: result
				// }).then(checkResult => {
				//   console.log(language, 'overall quality  ', averagePercent(checkResult));
				//   // console.log('quality below 50%', filterQuality(checkResult, 0.5, result));
				// });
			});
  	});
});
