let geoJsonToGraph = require('../index.js');
const fs = require('fs');

let rawdata = fs.readFileSync('./data/dover-data.json','utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  return data;
})

let data = JSON.parse(rawdata);
let graph = geoJsonToGraph(data);



