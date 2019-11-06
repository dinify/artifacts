/*
{
  "type": "FeatureCollection",
  "features": [
    {
      "geometry": {
        "type": "Point",
        "coordinates": [
          -76.9750541388,
          38.8410857803
        ]
      },
      "type": "Feature",
      "properties": {
        "description": "Southern Ave",
        "marker-symbol": "rail-metro",
        "title": "Southern Ave",
        "url": "http://www.wmata.com/rider_tools/pids/showpid.cfm?station_id=107",
        "lines": [
          "Green"
        ],
        "address": "1411 Southern Avenue, Temple Hills, MD 20748"
      }
    }
  ]
}
*/

function wrap() {
  return {
    prefix: '{"type":"FeatureCollection","features":[',
    suffix: ']}',
  }
}

function transform(line) {
  var obj = line instanceof Object ? line : JSON.parse(line);

  var final = {
    geometry: obj.longitude ? { "type": "Point", "coordinates": [obj.longitude, obj.latitude]} : null,
    type: "Feature",
    properties: {
      name: obj.name,
      url: obj.web_url
    }
  };

  var jsonString = JSON.stringify(final);
  return jsonString;
}
