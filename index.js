let graphulous = require('graphulous');
let distance = require('@turf/distance').default;
let point = require('turf-point');

function geoJsonToGraph(rawData, precision = 1e-7) {

  let graph = new graphulous.MultiGraph();
  let { nodes, edges } = getEdgesAndNodes();
  const data = formatData();
  graph.fromJson(data);

  function getEdgesAndNodes() {
    let nodes = [];
    let edges = [];
    rawData.features.forEach(feature => {
      if (feature.geometry.type === 'LineString') {
        let coordinates = feature.geometry.coordinates;
        let start = pointToString(coordinates[0]);
        let end = pointToString(coordinates[coordinates.length - 1]);

        if (nodes.indexOf(start) === -1) {
          nodes.push(start);
        }
        if (nodes.indexOf(end) === -1) {
          nodes.push(end);
        }

        let edge = coordinates.map(elm => pointToString(elm));

        //if no edges add edge
        if (edges.length === 0) {
          edges.push(edge);
        } else {
          //need to check the edges points against existing points
          checkEdge(nodes, edges, edge);
        }
      }
    });

    return {
      nodes,
      edges
    };
  }

  function checkEdge(nodes, edges, newEdge) {
    //Loop over new edge points
    for (let i = newEdge.length - 1; i >= 0; i--) {
      let point = newEdge[i];

      //Check against all existing edges
      for (let j = edges.length - 1; j >= 0; j--) {
        let edge = edges[j];
        let pointIndex = edge.indexOf(point);
        //If new edge intercets with old edge
        if (pointIndex !== -1) {
          //Check nodes array, if not there add point
          if (nodes.indexOf(point) === -1) {
            nodes.push(point);
          }
          //Check if point is at the start or end of newEdge && edge
          if (i !== 0 && i !== newEdge.length - 1) {
            edges.push(newEdge.slice(i, newEdge.length));
            newEdge.splice(i + 1, newEdge.length);
          }

          if (pointIndex !== 0 && pointIndex !== edge.length - 1) {
            //Remove old edge from edges
            edges.splice(j, 1);
            //Split up old edge
            edges.unshift(edge.slice(0, pointIndex + 1));
            edges.unshift(edge.slice(pointIndex));
          }
        }

      }
    }

    //TODO: NEED to add node for non end edge here???
    //Only add remaining part of newEdge if it has more than 2 points
    if (newEdge.length > 1) {
      edges.push(newEdge);
    }

    return {
      nodes,
      edges
    };
  }

  function pointToString(point) {
    let tmp = roundCoord(point, precision);
    return `${tmp[0]},${tmp[1]}`;
  }

  function roundCoord(c, precision) {
    return [
      Math.round(c[0] / precision) * precision,
      Math.round(c[1] / precision) * precision,
    ];
  }

  function formatData() {
    nodes = nodes.map(n => { return { name: n }; });
    edges = edges.map(edge => {
      let length = 0;
      for (let i = 0; i < edge.length - 1; i++) {
        let p = edge[i].split(',');
        p = [parseFloat(p[0]), parseFloat(p[1])];
        let p2 = edge[i + 1].split(',');
        p2 = [parseFloat(p2[0]), parseFloat(p2[1])];
        length += distance(point(p), point(p2), { units: 'miles' });
      }
      return {
        source: edge[0],
        target: edge[edge.length - 1],
        data: {
          path: edge,
          length
        }
      };
    });

    return {
      nodes,
      edges
    };
  }
  return { ...graph };
}

module.exports = geoJsonToGraph;