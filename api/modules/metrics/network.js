const express = require('express')
const router = express.Router()
const auth = require('express-jwt');
const guard = require('express-jwt-permissions')();
const db = require('database');
const config = require('../../config');
const debug = require('debug')('iot:api');
const {success} = require('../../network/responses');

let Metric;

router.get('*', async (req, res, next) =>{
  if(!Metric){
    try {
      const services = await db(config.database);
      Metric = services.Metric;
    } catch (error) {
      next(error)
    }
  }
  next();
})

router.get('/:uuid',
auth({secret: config.auth.secret, algorithms: [config.auth.algorithms]}),
guard.check(['metrics:read']),
async (req, res, next) =>{
  const {uuid} = req.params;
  debug(`Request to /metrics/${uuid}`);

  try {
    const metrics = await Metric.findByAgentUuid(uuid);
    if(!metrics || metrics.length === 0) return next(new Error(`Metrics not found for agent with ${uuid}`));
    success(req,res,metrics);
  } catch (error) {
    next(error);
  }
});

router.get('/:uuid/:type', async (req, res, next) =>{
  const { uuid, type } = req.params;
  debug(`Request to /metrics/${uuid}/${type}`);
  try {
    const metrics = await Metric.findByTypeAgentUuid(type, uuid);
    if(!metrics || metrics.length === 0) return next(new Error(`Metrics ${type} not found for agent with ${uuid}`));
    success(req,res,metrics);
  } catch (error) {
    next(error);
  }
  res.send({uuid, type});
});

module.exports = router;
