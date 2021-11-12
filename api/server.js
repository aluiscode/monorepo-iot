const http = require('http');
const chalk = require('chalk');
const express = require('express');
const router = require('./network/routes');
const { notFound, errorHandler } = require('./utils/midleware/errorHandler');
const config = require('./config');

const app = express();

const server = http.createServer(app);

//Routes
router(app);

//Error handlers
app.use(notFound);
app.use(errorHandler);

server.listen(config.port, () => {
  console.log(`${chalk.green('[Api]')} Server is running in http://localhost:${config.port}`);
})
