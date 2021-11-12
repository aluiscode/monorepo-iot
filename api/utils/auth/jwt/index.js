const jwt = require('jsonwebtoken');

function sign(payload, secret, callback){
  jwt.sign(payload, secret, callback);
}

function verify(token, secret){
  jwt.verify(token, secret);
}

module.exports = {
  sign,
  verify,
}