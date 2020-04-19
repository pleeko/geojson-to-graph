let graphulous = require('graphulous');
const fs = require('fs');
let turf = require('@turf/turf');

function geoJsonToGraph(rawData) {
  let graph = new graphulous.Graph();

  // cleanseData();
  buildGraph();

  function buildGraph() {
    let nodes = {};
    let edges = [];
    rawData.features.forEach(feature => {

      if (feature.geometry.type === 'LineString') {
        let start = pointToString(feature.geometry.coordinates[0]);
        let end = pointToString(feature.geometry.coordinates[feature.geometry.coordinates.length - 1]);

        if (typeof nodes[start] === 'undefined') {
          nodes[start] = { count: 1 };
        }
        if (typeof nodes[end] === 'undefined') {
          nodes[end] = { count: 1 };
        }

        let edge = feature.geometry.coordinates.map(elm => {
          return (pointToString(elm));
        });

        //if no edges add edge
        if (edges.length === 0) {
          edges.push(edge);
        } else {
          //need to check the edges points against existing points
          let ret = checkEdge(nodes, edges, edge, start, end, feature.properties.name);
          nodes = ret.nodes;
          edges = ret.edges;
        }
      }
    });

    printEdges(edges);
    printPoints(nodes);
  }


  function checkEdge(nodes, edges, newEdge, start, end, name) {
    //loop over new edge points
    let acc = [];
    for (let i = newEdge.length - 1; i >= 0; i--) {

      //cneck with all existing edges
      let point = newEdge[i];

      for (let j = edges.length - 1; j >= 0; j--) {
        let edge = edges[j];
        //if new edge intercets with old edge
        if (edge.indexOf(point) !== -1) {

          //check nodes array, if not there add it
          if (typeof nodes[point] === 'undefined') {
            nodes[point] = { count: 1 };
          } else {
            nodes[point].count ++;
          }

            //check if it is an end on the old or new edge
            if(newEdge[i] !== start && newEdge[i] !== end){     
            let e1 = newEdge.slice(i, newEdge.length);
            newEdge.splice(i + 1, newEdge.length);
            edges.push(e1);         
          }

            let pointIndex = edge.indexOf(point);
            if(pointIndex !== 0 && pointIndex !== edge.length - 1){
            //remove old edge from edges
              edges.splice(j, 1);
              //split up old edge
              let pointIndex = edge.indexOf(point);
              let eo1 = edge.slice(0, pointIndex + 1);
              let eo2 = edge.slice(pointIndex);
              edges.push(eo1);
              edges.push(eo2);
            }
        }

      }
    }

    //TODO: NEED to add node for non end edge here???
    edges.push(newEdge);

    return {
      nodes,
      edges
    }
  }

  function pointToString(point) {
    let tmp = roundCoord(point, 1e-7)  
    return `${tmp[0]},${tmp[1]}`;
  }

  function roundCoord(c, precision) {
    return [
      Math.round(c[0] / precision) * precision,
      Math.round(c[1] / precision) * precision,
    ];
  };


  function cleanseData() {
    let acc = []
    rawData.features.forEach(feature => {
      let tmp = rawData.features;

      if (acc.findIndex(a => a.properties.name === feature.properties.name) === -1) {
        let filtered = tmp.filter(t => t.properties.name === feature.properties.name);
        if (filtered.length > 1) {
          console.log(feature.properties.name)
          acc.push(...filtered)
        }
      }
    });
  }

  // ++++++++++++++ PRINT FUNCTIONS ++++++++++++++

  function printEdges(edges) {
    let steps = [];
    edges.forEach((edge) => {
      let weewewe = []
      edge.forEach(e => {
        let pp = e.split(',');
        weewewe.push([parseFloat(pp[0]), parseFloat(pp[1])]);
      });
      steps.push({
        type: 'Feature',
        properties: {
          'stroke-width': 6
        },
        geometry: {
          type: 'LineString',
          coordinates: weewewe
        }
      })
    });
    let eeeee = {
      type: 'FeatureCollection',
      features: steps
    };




    fs.writeFile('./edges.json', JSON.stringify(eeeee), function (err) {
      if (err) return console.log(err);
      console.log('edges.json');
    });
  }


  function printPoints(nodes) {
    points = [];
    Object.keys(nodes).forEach((element) => {
      let p = null;
      var res = element.split(',');

      p = turf.point([parseFloat(res[0]), parseFloat(res[1])]);
      p.properties = {
        "marker-color": "#ff2600",
        "marker-size": "medium",
        "marker-symbol": "",
        title: nodes[element].count
      }
      points.push(
        p
      );
    });
    let ret = {
      "type": "FeatureCollection",
      "features": points
    }
    fs.writeFile('./points.json', JSON.stringify(ret), function (err) {
      if (err) return console.log(err);
      console.log('points.json');
    });
  }
  
  return {
    graph
  }
}

module.exports = geoJsonToGraph;