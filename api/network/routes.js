const agents = require('../modules/agents/network');
const metrics = require('../modules/metrics/network');

const routes = function (server) {
  server.use('/agents', agents);
  server.use('/metrics', metrics);
}

module.exports = routes;
