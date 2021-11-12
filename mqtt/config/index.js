require('dotenv').config();
const debug = require('debug')('iot:db:setup');

const config = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: s => debug(s),
  setup: false,
}

module.exports = config;
