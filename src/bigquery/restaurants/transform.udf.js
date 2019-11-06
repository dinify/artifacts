function transform(line) {
  var obj = line instanceof Object ? line : JSON.parse(line);

  var langs;
  if (obj.langDist) {
	langs = Object.keys(obj.langDist).map(function(lang) {
    return {
      language: lang,
      count: obj.langDist[lang].count
    };
  });
  }

  var final = {
    id: obj._id.$oid,
    location_id: obj.location_id,
    name: obj.name,
    email: obj.email,
    phone: obj.phone,
    city: obj.parent_display_name,
    address: obj.address,
    location: obj.longitude ? (JSON.stringify({ "type": "Point", "coordinates": [obj.longitude, obj.latitude]})) : null,
    location_string: obj.longitude ? ([obj.latitude, obj.longitude].join(',')) : null,
    num_reviews: obj.num_reviews,
    raw_ranking: obj.raw_ranking,
    photo_url: (obj.photo && obj.photo.images && obj.photo.images.original) ? obj.photo.images.original.url : null,
    ranking_denominator: obj.ranking_denominator,
    ranking_position: obj.ranking_position,
    web_url: obj.web_url,
    website: obj.website,
    language_distribution: langs
  };

  var jsonString = JSON.stringify(final);
  return jsonString;
}

/*

Template form:

restaurants-text-to-bq
gs://storage.dinify.app/bigquery/restaurants-transform.udf.js
gs://storage.dinify.app/bigquery/restaurants-schema.json
transform
dinify:tripadvisor.restaurants
gs://storage.dinify.app/bigquery/restaurants.json
gs://storage.dinify.app/bigquery/temp

*/
