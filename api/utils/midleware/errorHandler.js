const config = require('../../config');
const { error } = require('../../network/responses')

function notFound(err, req, res, next){
  if(err.message.match(/not found/)){
    error(req, res, 'Error not found', 404, err);
  }
  next(err)
}

function errorHandler(err, req, res, next){
  if(config.dev === 'development'){
    error(req, res, err.message, err.status, err.stack);
  }
  else{
    error(req, res, 'Internal Error', err.status, err.stack);
  }
}

module.exports = {
  notFound,
  errorHandler,
}
