const debug = require('debug')('iot:mqtt');
const chalk = require('chalk');
const redisPersistence = require('aedes-persistence-redis')
const db = require('database');
const config = require('./config');
const { parsePayload } = require('./utils');

//Redis configuration
const aedes = require('aedes')({
  persistence: redisPersistence({
    port: 6379,
    host: '127.0.0.1',
    family: 4,
    maxSessionDelivery: 100
  })
});

const server = require('net').createServer(aedes.handle)
const port = 1883;
const clients = new Map();

let Agent, Metric;

server.listen(port, async () => {
  const services = await db(config).catch(handleFatalError);

  Agent = services.Agent;
  Metric = services.Metric;

  console.log(`${chalk.green('[Mqtt]')} server is running ${port}`)
});

//Event when a client connect to server
aedes.on('clientReady', (client) => {
  debug(`Client connected: ${client.id}`);
  clients.set(client.id, null);
});

//Event when a client disconnect from server
aedes.on('clientDisconnect', async (client) => {
  debug(`Client Disconnected: ${client.id}`);
  const agent = clients.get(client.id);

  if(agent){
    agent.connected = false;
    try {
      await Agent.createOrUpdate(agent);
    } catch (error) {
      return handleError(error);
    }
  }

  clients.delete(client.id);

  aedes.publish({
    topic: 'agent/disconnected',
    payload: JSON.stringify({
      agent: {
        uuid: agent.uuid,
      }
    })
  })
  debug(`Client (${client.id}) assosiated to Agent (${agent.uuid}) wad disconnected`)
});

//When someone publish a new message
aedes.on('publish', async (packet, client) => {
  debug(`Received: ${packet.topic}`);

  switch(packet.topic){
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`);
      break;
    case 'agent/message':
      debug(`Payload: ${packet.payload}`);

      const payload = parsePayload(packet.payload);
      if(payload){
        debug(`Payload: ${packet.payload}`);
        payload.agent.connected = true;
        let agent;
        try {
          agent = await Agent.createOrUpdate(payload.agent);
        } catch (error) {
          return handleError(error)
        }

        debug(`Agent ${agent.uuid} saved`);

        // Notify agent is connected
        // client.id has not agent, come in
        if(!clients.get(client.id)){
          clients.set(client.id, agent)
          aedes.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected,
              }
            })
          })
        }
        //Store metrics
        for(let metric of payload.metrics){
          let metricSaved;
          try {
            metricSaved = await Metric.create(agent.uuid, metric);
          } catch (error) {
            return handleError(error);
          }

          debug(`Metric ${metricSaved.id} saved on agent ${agent.uuid}`)
        }
      }
      break;
  }
});

aedes.on('clientError', (client, err) => {
  console.log('client error', client.id, err.message, err.stack)
})

aedes.on('connectionError', (client, err) => {
  console.log('client error', client, err.message, err.stack)
})

function handleFatalError(err){
  console.error(`${chalk.red('[fatal error]')} ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

function handleError(err){
  console.error(`${chalk.red('[error]')} ${err.message}`);
  console.error(err.stack);
}