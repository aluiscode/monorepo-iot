const db = require('../');
const config = require('../config');

(async function run(){
  try {
    const { Agent, Metric } = await db(config);
    const agent = await Agent.createOrUpdate({
      uuid: 'y-yy-yyy',
      name: 'test',
      username: 'test',
      hostname: 'test',
      pid: 1,
      connected: true,
    })

    const agents = await Agent.findAll()

    const metric = await Metric.create(agent.uuid,{
      type: 'memory',
      value: '300'
    });

    const metrics = await Metric.findByAgentUuid(agent.uuid);

    const metricsType = await Metric.findByTypeAgentUuid('memory', agent.uuid)

    console.log(agent);
    console.log(agents);
    console.log(metrics);
    console.log(metric)
    console.log(metricsType);
  } catch (error) {
    handleFatalError(error);
  }
})()

function handleFatalError(err){
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
}
