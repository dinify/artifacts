function transform(line) {
  var obj = line instanceof Object ? line : JSON.parse(line);

  function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
  }

  function getDBDatetime(date) {
    var exists = date && date.$date;
    if (!exists) return null;

    var dt = new Date(date.$date.replace('Z', ''));
  	var pad2 = function(num){ return pad(num, 2) };
  	var dtstring = dt.getFullYear()
      + '-' + pad2(dt.getMonth()+1)
      + '-' + pad2(dt.getDate())
      + ' ' + pad2(dt.getHours())
      + ':' + pad2(dt.getMinutes())
      + ':' + pad2(dt.getSeconds());
  	return dtstring;
  }

  var final = {
    id: obj._id.$oid,
    review_id: obj.id,
    location_id: obj.location_id,
    language: obj.lang,
    helpful_votes: obj.helpful_votes,
    published_date: getDBDatetime(obj.published_date),
    rating: obj.rating,
    travel_date: obj.travel_date ? (obj.travel_date + '-01') : null,
    url: obj.url,
    user: obj.user ? {
      user_id: obj.user.user_id,
      name: obj.user.name,
      username: obj.user.username,
      user_location: obj.user.user_location ? obj.user.user_location.name : null,
      locale: obj.user.locale ? obj.user.locale.replace('_', '-') : null,
      reviews: obj.user.contributions ? parseInt(obj.user.contributions.reviews) : null,
      restaurant_reviews: obj.user.contributions ? parseInt(obj.user.contributions.restaurant_reviews) : null,
      link: obj.user.link
    } : null
  };

  var jsonString = JSON.stringify(final);
  return jsonString;
}

/*

Template form:

reviews-text-to-bq
gs://storage.dinify.app/bigquery/reviews-transform.udf.js
gs://storage.dinify.app/bigquery/reviews-schema.json
transform
dinify:tripadvisor.reviews
gs://storage.dinify.app/bigquery/reviews.json
gs://storage.dinify.app/bigquery/temp

*/
