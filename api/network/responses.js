const chalk = require('chalk');

const success = (req, res, message, status = 200) => {
  res.status(status).send({
    error: '',
    body: message,
  })
}

const error = (req, res, message, status, details) => {
  console.log(`${chalk.red('[Response error]')} ${details}`);
  res.status(status || 500).send({
    error: message,
    body: details,
  })
}

module.exports = {
  success,
  error,
}
