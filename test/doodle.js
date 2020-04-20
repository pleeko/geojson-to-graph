let geoJsonToGraph = require('../index.js');
const fs = require('fs');

let rawdata = fs.readFileSync('./test/data/small-data.json','utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  return data;
});

let data = JSON.parse(rawdata);
let graph = geoJsonToGraph(data);
// console.log(JSON.stringify(graph))
let start = graph.pointers['-73.556431,40.68849'].key;
let end = graph.pointers['-73.557416,40.687484999999995'].key;


console.log(graph.matrix[start][end]);



// fs.writeFile('./small-op.json', JSON.stringify(graph), function (err) {
//   if (err) return console.log(err);
//   console.log('edges.json');
// });