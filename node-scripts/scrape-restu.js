let result = {};

// scrapes facebook page id
Array.from(document.getElementById('search-result-list-content').children).forEach(child => {
	const rLink = child.getElementsByClassName('card-item-link')[0].href;
	console.log(rLink);
    fetch(rLink).then(result => {
        return result.text();
    }).then(text => {
        const el = document.createElement('html');
        el.innerHTML = text;
        const facebook = el.getElementsByClassName('button-link track-fb')[0].href;
		const restaurantId = rLink.split('/')[rLink.split('/').length - 2];

		const obj = {facebook};
		console.log(restaurantId, obj);
		result[restaurantId] = obj;
    })
})
