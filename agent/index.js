const debug = require('debug')('iot:agent');
const os = require('os');
const util = require('util');
const mqtt = require('mqtt');
const defaults= require('defaults');
const EventEmitter = require('events');
const uuid = require('uuid');

const { parsePayload } = require('./utils');

const options = {
  name: 'unamed',
  username: 'luis',
  interval: 5000,
  mqtt: {
    host: 'mqtt://localhost:1883'
  }
}

class Agent extends EventEmitter{
  constructor(opts){
    super();
    this._options = defaults(opts, options);
    this._started = false; //timer status
    this._timer =  null;
    this._client = null;  //mqtt client
    this._agentId = null;
    this._metrics = new Map();
  }

  addMetric(type, fn){
    this._metrics.set(type, fn);
  }

  removeMetric(type){
    this._metrics.delete(type);
  }

  connect(){
    // if timer dosen't initialice
    if(!this._started){
      const opts = this._options;
      this._client = mqtt.connect(opts.mqtt.host); //connection to broker
      this._started= true;

      //suscribe a topic in mqtt server
      this._client.subscribe('agent/message');
      this._client.subscribe('agent/connected');
      this._client.subscribe('agent/disconnected');

      //client suscribe connect event to initialize
      //timer and emit connected
      this._client.on('connect', () => {
        this._agentId = uuid.v4();

        this.emit('connected', this._agentId);
        this._timer = setInterval(async () => {
          // send data from sensors
          if(this._metrics.size > 0){
            let message = {
              agent: {
                uuid: this._agentId,
                username: opts.username,
                name: opts.name,
                hostname: os.hostname() || 'localhost',
                pid: process.pid,
              },
              metrics: [],
              timestamp: new Date().getTime(),
            }

          //Managmet callback and promises
          for(let [metric, fn] of this._metrics){
            //function is callback
            if( fn.length === 1){
              fn = util.promisify(fn);
            }

            message.metrics.push({
              type: metric,
              value: await Promise.resolve(fn()),
            })
          }

          debug(`Sending ${message}`)

          this._client.publish('agent/message', JSON.stringify(message))
          this.emit('message', message);
          // this.emit('agent/message', 'this is a message');
          }
        }, opts.interval)
      });

      // suscription to message from mqtt server
      this._client.on('message', (topic, payload)=>{
        payload = parsePayload(payload);

        //broadcast condition
        let broadcast = false;
        switch(topic){
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
            broadcast = payload && payload.agent && payload.agent.uuid !== this._agentId
            break;
        }

        if(broadcast){
          this.emit(topic,payload);
        }
      });

      // when client has an error
      this._client.on('error', () => this.disconnect())
    }
  }

  disconnect(){
    //if timer is initialice
    if(this._started){
      clearInterval(this._timer);
      this._started=false;
      this.emit('disconnected', this._agentId);
      this._client.end();
    }
  }
}

module.exports = Agent;
