result = [];
'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ').map(char => {
	let slug = 'culinary_dictionary_food_glossary';
	if (char !== 'a') slug += `_${char}`;
	fetch(`https://theodora.com/food/${slug}.html`)
	.then(b => b.text())
	.then(text => {
		const el = document.createElement('html');
        el.innerHTML = text;
		[...el.querySelectorAll('#mainpage > font > table > tbody > tr > td > b')].map(node => {
			const raw = node.innerHTML.trim().replace(':', '');
			let output = {};
			if (raw.includes('(')) {
				output.category = raw.split(/\(|\)/)[1];
				output.name = raw.split('(')[0].trim();
			}
			else output.name = raw;
			result = [...result, output];
		});
	});
});

deduped = [];
result.map(item => {
    return {
        name: item.name.toLowerCase().trim(), 
        category: item.category ? item.category.toLowerCase().trim() : undefined
    };
}).forEach(item => { 
	if (item.name.includes(',')) {
		item.name.split(',').forEach(part => {
			let itemi = {
				name: part.trim().toLowerCase(), 
				category: item.category
			};
			if(!deduped.map(i => i.name).includes(itemi.name)) { deduped.push(itemi); }
		});
	}
	else if(!deduped.map(i => i.name).includes(item.name)) { deduped.push(item); }
});