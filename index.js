let graphulous = require('graphulous');

function geoJsonToGraph() {
  this.graph = new graphulous.Graph();

  return {
    graph
  }

}

module.exports = geoJsonToGraph;
