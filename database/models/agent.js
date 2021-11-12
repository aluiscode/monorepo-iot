const { DataTypes } = require('sequelize');
const setupDatabase = require('../lib/db');

function setupAgentModel(config){
  const sequelize = setupDatabase(config);

  const model = {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    hostname: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    pid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    connected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  }

  return sequelize.define('agent', model);
}


module.exports = setupAgentModel;