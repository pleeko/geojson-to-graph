let graphulous = require('graphulous');
let { printEdges, printPoints } = require('./print.js');
let distance = require('@turf/distance').default;
let point = require('turf-point');

function geoJsonToGraph(rawData, precision = 1e-7) {

  let graph = new graphulous.MultiGraph();
  
  let { nodes, edges } = getEdgesAndNodes();
  let data = formatData();
  graph.fromJson(data);

  function getEdgesAndNodes() {
    let nodes = {};
    let edges = [];
    rawData.features.forEach(feature => {

      if (feature.geometry.type === 'LineString') {
        let start = pointToString(feature.geometry.coordinates[0]);
        let end = pointToString(feature.geometry.coordinates[feature.geometry.coordinates.length - 1]);

        if (typeof nodes[start] === 'undefined') {
          nodes[start] = {};
        }
        if (typeof nodes[end] === 'undefined') {
          nodes[end] = {};
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

    return {
      nodes,
      edges
    }
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
            nodes[point] = {};
          }
          //check if it is an end on the old or new edge
          if (newEdge[i] !== start && newEdge[i] !== end) {
            let e1 = newEdge.slice(i, newEdge.length);
            newEdge.splice(i + 1, newEdge.length);
            edges.push(e1);
          }

          let pointIndex = edge.indexOf(point);
          if (pointIndex !== 0 && pointIndex !== edge.length - 1) {
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
    let tmp = roundCoord(point, precision)
    return `${tmp[0]},${tmp[1]}`;
  }

  function roundCoord(c, precision) {
    return [
      Math.round(c[0] / precision) * precision,
      Math.round(c[1] / precision) * precision,
    ];
  };

  function formatData() {
    nodes = Object.keys(nodes).map(n => { return { name: n }; })
    edges = edges.map(edge => {
      let length = 0;
      for (let i = 0; i < edge.length - 1; i++) {
        let p = edge[i].split(',');
        p = [parseFloat(p[0]), parseFloat(p[1])]
        let p2 = edge[i + 1].split(',');
        p2 = [parseFloat(p2[0]), parseFloat(p2[1])]
        length += distance(point(p), point(p2), { units: 'miles' });
      }
      return {
        source: edge[0],
        target: edge[edge.length - 1],
        data: {
          path: edge,
          length
        }
      }
    });

    return { nodes, edges };
  }
  return { ...graph }
}

module.exports = geoJsonToGraph;