
const fs = require('fs');
const geoJsonToGraph = require('./../index');

let smallOp = fs.readFileSync('./test/data/output/small-op.json','utf8', (err, data) => {
  return data;
});

let smallData = fs.readFileSync('./test/data/small-data.json','utf8', (err, data) => {
  return data;
});

smallData = JSON.parse(smallData);

describe('geojson-to-graph', () => {
  it('expect data to be correct', () => {
    let graph = geoJsonToGraph(smallData);
    expect(JSON.stringify(graph)).toEqual(smallOp);
  });
});