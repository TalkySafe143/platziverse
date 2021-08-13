'use strict'

const test = require('ava')
const fixturesMetrics = require('./fixtures/metric')
const agentFixtures = require('./fixtures/agent')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const config = {
  logging: function () {}
}

const uuid = 'yyy-yyy-yyy'
let AgentStub = null

const uuidArgs = { where: { uuid } }

const typeUuidArgs = {
  attributes: ['id', 'type', 'value', 'createdAt'],
  where: {
    type: 'cpu'
  },
  limit: 20,
  order: [['createdAt', 'DESC']],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

const agentUuisArgs = {
  attributes: ['type'],
  group: ['type'],
  include: [{
    model: AgentStub,
    attributes: [],
    where: {
      uuid
    }
  }],
  raw: true
}

const newMetric = Object.assign({}, fixturesMetrics.single)

const id = 1
let sandbox = null
let MetricStub = null
let db = null

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  MetricStub = {
    belongsTo: sandbox.spy()
  }

  AgentStub = {
    hasMany: sandbox.spy()
  }

  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
    toJSON: () => newMetric
  }))

  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs(agentUuisArgs).returns(Promise.resolve(fixturesMetrics.byAgentId(id)))
  MetricStub.findAll.withArgs(typeUuidArgs).returns(Promise.resolve(fixturesMetrics.byType('cpu')))

  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  const setupDataBase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDataBase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Metric', t => {
  t.truthy(db.Metric, 'The metric object should exists!')
})

test.serial('Metric#create', async t => {
  const newFila = await db.Metric.create('yyy-yyy-yyy', newMetric)

  t.true(AgentStub.findOne.calledOnce, 'The Agent.findOne must be called once')
  t.true(MetricStub.create.calledOnce, 'create should be called once')
})

test.serial('Metric#findAll', async t => {
  const a = await db.Metric.findByAgentUuid('yyy-yyy-yyy')
  const b = await db.Metric.findByTypeAgentUuid('cpu', 'yyy-yyy-yyy')

  t.true(MetricStub.findAll.calledTwice, 'findOne should be called twice')
})
