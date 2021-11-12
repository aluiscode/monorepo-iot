const setupDatabase = require('./lib/db');
const setupAgentModel = require('./models/agent');
const setupMetricModel = require('./models/metric');
const setupAgent = require('./lib/agent');
const setupMetric = require('./lib/metric');
const defaults = require('defaults');

module.exports = async (config) => {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max:10,
      min: 0,
      idle: 5000,
    },
    query: {
      raw: true,
    }
  })

  const sequelize = setupDatabase(config);
  const agentModel = setupAgentModel(config);
  const metricModel = setupMetricModel(config);

  agentModel.hasMany(metricModel);
  metricModel.belongsTo(agentModel);

  //If error connection, code stop here!!!
  sequelize
  .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
    });

  //Create tables with sequelize
  if(config.setup){
    await sequelize.sync({ force: true })
  }

  const Agent = setupAgent(agentModel)
  const Metric = setupMetric(metricModel, agentModel)

  return {
    Agent,
    Metric,
  }
}
