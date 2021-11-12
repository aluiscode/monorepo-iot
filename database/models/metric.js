const { DataTypes } = require('sequelize');
const setupDatabase = require('../lib/db');

function setupMetricModel(config){
  const sequelize = setupDatabase(config);

  const model = {
    type: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }

  return sequelize.define('metric', model);
}

module.exports = setupMetricModel;
