const cldr = require('cldr').load('../cldr-xml');
const fs = require('fs');

const distinct = (value, index, self) => self.indexOf(value) === index;
const languageIds = cldr.localeIds.map(id => id.split('_')[0]).filter(distinct);

fs.writeFileSync('./extracted/languageIds', JSON.stringify(languageIds, null, 2))
// fs.writeFileSync('./extracted/localeIds', JSON.stringify(localeIds, null, 2))

console.log(languageIds);
// console.log(cldr.extractSubdivisionDisplayNames('en'));
// console.log(cldr.extractTerritoryDisplayNames('en'));
