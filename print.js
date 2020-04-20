
let point = require('turf-point');
const fs = require('fs');

function printEdges(edges) {
  let steps = [];
  edges.forEach((edge) => {
    let coordinates = [];
    edge.forEach(e => {
      let pp = e.split(',');
      coordinates.push([parseFloat(pp[0]), parseFloat(pp[1])]);
    });
    steps.push({
      type: 'Feature',
      properties: {
        'stroke-width': 6
      },
      geometry: {
        type: 'LineString',
        coordinates
      }
    });
  });
  let ret = {
    type: 'FeatureCollection',
    features: steps
  };




  fs.writeFile('./edges.json', JSON.stringify(ret), function (err) {
    if (err) return console.log(err);
    console.log('edges.json');
  });
}


function printPoints(nodes) {
  let points = [];
  Object.keys(nodes).forEach((element) => {
    let p = null;
    var res = element.split(',');

    p = point([parseFloat(res[0]), parseFloat(res[1])]);
    p.properties = {
      'marker-color': '#ff2600',
      'marker-size': 'medium',
      'marker-symbol': '',
      title: element
    };
    points.push(
      p
    );
  });
  let ret = {
    'type': 'FeatureCollection',
    'features': points
  };
  fs.writeFile('./points.json', JSON.stringify(ret), function (err) {
    if (err) return console.log(err);
    console.log('points.json');
  });
}

module.exports = {
  printPoints,
  printEdges
};