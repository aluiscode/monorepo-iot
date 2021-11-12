const express = require('express');
const router = express.Router()
const auth = require('express-jwt');
const debug = require('debug')('iot:api');
const db = require('database');
const config = require('../../config');
const {success} = require('../../network/responses');

let Agent;

router.get('*', async (req, res, next) =>{
  if(!Agent){
    try {
      const services = await db(config.database);
      Agent = services.Agent;
    } catch (error) {
      next(error)
    }
  }
  next();
});

router.get('/',
auth({secret: config.auth.secret, algorithms: [config.auth.algorithms]}),
async (req, res, next) => {
  debug(`Request to /agents`);

  const { user } = req;

  if(!user || !user.username){
    return next(new Error('Unauthorized'));
  }

  try {
    let agents;
    //Find all
    if(user.admin){
      agents = await Agent.findConnected();
    } else {
      agents = await Agent.findByUsername(user.username);
    }

    success(req,res, agents);
  } catch (error) {
    next(error);
  }
});

router.get('/:uuid', async (req, res, next) =>{
  const {uuid} = req.params;
  debug(`Request to /agents/${uuid}`);

  try {
    const agent = await Agent.findByUuid(uuid);
    if(!agent) return next(new Error('Agent not found'));
    success(req, res, agent)
  } catch (error) {
    next(error)
  }
});

module.exports = router;
