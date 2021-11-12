const proxyquire = require('proxyquire');

let config = {
  logging: () => {},
}

let MetricStub = {
  belongsTo: () => {},
}

let AgentStub = null;
let db = null;

beforeEach(async () => {
  AgentStub = {
    hasMany: () => {},
  }

  const setupDatabase = proxyquire('../../index',{
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test('Agent Exist', () => {
  expect(db.Agent).toBeTruthy();
});