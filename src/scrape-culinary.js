
let validLangs = ['Spanish',
'French',
'Middle Eastern- Greek',
'African',
'Russian',
'India',
'Italian',
'German',
'Great Britain',
'see below',
'Portuguese',
'Scottish',
'Japanese',
'Italian and Spanish',
'Dutch',
'Greek',
'North African',
'Norwegian',
'Mexican',
'Turkish',
'Australia',
'Indian',
'Chinese',
'French and Italian',
'Swiss',
'talian',
'Hungarian',
'Middle Eastern',
'Sp.',
'China',
'Middle East',
'Spanish and Italian',
'Austrian',
'Latin American',
'Asian'];
let deduped = [];
let langs = [];
let result = [];
'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ').map(char => {
	let slug = 'culinary_dictionary_food_glossary';
	if (char !== 'a') slug += `_${char}`;
	fetch(`https://theodora.com/food/${slug}.html`)
	.then(b => b.text())
	.then(text => {
		const el = document.createElement('html');
				el.innerHTML = text;
			[...el.querySelectorAll('#mainpage > font > table > tbody > tr')].map(e => {
				let children = [...e.children];
				if (children.length === 2) {
					let name = children[0].innerText.toLowerCase().replace(':', '').trim();
					let description = children[1].innerText.trim();
					let category, language;
					if (name.includes('(')) {
									category = name.split(/\(|\)/)[1];
									name = name.split('(')[0].trim();
							}
					try {
						if (description.split(/\{|\}|\[|\]/).filter(l => validLangs.includes(l)).length > 0) {
							language = description.split(/\[|\]/).filter(l => validLangs.includes(l))[0].trim();
							if (!langs.includes(language)) langs.push(language);
							let newDescription = description.split(/\{|\}|\[|\]/)[2];
							if (newDescription) description = newDescription.trim();
						}
					}
					catch (e) {}
					result = [...result, {
						name,
						language,
						category,
						description
					}];
				}
			}
		);
	});
});
result.forEach(item => { 
	const pushDeduper = ({description, language, ...addItem}) => {
		let results = deduped.filter(d => d.name === addItem.name);
		if (results.length) {
			let index = deduped.findIndex(d => d.name === addItem.name);
			deduped[index] = {
				...deduped[index], 
				language: results[0].language || language,
				descriptions: [...results[0].descriptions, description]
			};
		}
		else deduped.push({
			...addItem, 
			language,
			descriptions: [description]
		});
	};
	if (item.name.includes(',')) {
		item.name.split(',').forEach(part => {
			let itemi = {
				...item,
				name: part.trim().toLowerCase()
			};
			pushDeduper(itemi);
		});
	}
	else pushDeduper(item);
});