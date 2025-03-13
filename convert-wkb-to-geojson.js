const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const wkx = require('wkx');
const path = require('path');

const inputFilePath = path.resolve('tri_cities_report_jan_2025.csv');
const outputFilePath = path.resolve('tri_cities_report_jan_2025_geojson.csv');

// Store converted rows
const results = [];

fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (row) => {
        try {
            // Convert WKB to GeoJSON
            const wkbHex = row.the_geom;
            const geometry = wkx.Geometry.parse(Buffer.from(wkbHex, 'hex'));

            // Create a proper GeoJSON Feature object
            const featureObject = {
                type: "Feature",
                properties: {
                    cartodb_id: row.cartodb_id,
                    name: row.name,
                    benchmark_price: row.benchmark_price
                },
                geometry: geometry.toGeoJSON()
            };

            const geojson = JSON.stringify(featureObject);

            // Create new row with GeoJSON instead of WKB
            results.push({
                the_geom: geojson,
                cartodb_id: row.cartodb_id,
                name: row.name,
                benchmark_price: row.benchmark_price
            });
        } catch (error) {
            console.error(`Error processing row with id ${row.cartodb_id}:`, error);
            // Keep original data if there's an error
            results.push(row);
        }
    })
    .on('end', () => {
        const csvWriter = createObjectCsvWriter({
            path: outputFilePath,
            header: [
                { id: 'the_geom', title: 'the_geom' },
                { id: 'cartodb_id', title: 'cartodb_id' },
                { id: 'name', title: 'name' },
                { id: 'benchmark_price', title: 'benchmark_price' }
            ],
            fieldDelimiter: ',',
            recordDelimiter: '\n',
            quoteStrings: "'",  // Use single quotes instead of double quotes
            alwaysQuote: true   // Always quote all fields
        });

        csvWriter.writeRecords(results)
            .then(() => {
                console.log(`Conversion complete! Output saved to: ${outputFilePath}`);
            })
            .catch((error) => {
                console.error('Error writing CSV file:', error);
            });
    });
