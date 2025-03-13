const wkx = require('wkx');

const wkbHex = '0106000020E6100000010000000103000000010000002F0000008C8BFE2B46BA5EC0FD1C59D857A54840...'; // Your full WKB

// Convert WKB to GeoJSON
const geojson = wkx.Geometry.parse(Buffer.from(wkbHex, 'hex')).toGeoJSON();

console.log(JSON.stringify(geojson, null, 2));
