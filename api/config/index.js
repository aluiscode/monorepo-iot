require('dotenv').config();
const debug = require('debug')('iot:api:setup');

const config ={
  dev: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  database: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: s => debug(s),
  },
  auth: {
    secret: process.env.AUTH_JWT_SECRET,
    algorithms: process.env.AUTH_JWT_ALGORITHM,
  }
}

module.exports = config;
