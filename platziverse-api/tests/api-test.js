'use strict'

const test = require('ava')
const supertest = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentMock = require('./fixtures/agent')
const metricMock = require('./fixtures/metric')

let sandbox = null
let server = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}

let uuid = 'yyy-yyy-yyy'
let id = 1

test.beforeEach(async () => {
    sandbox = sinon.createSandbox()
    dbStub = sandbox.stub()
    dbStub.returns(Promise.resolve({
        Agent: AgentStub,
        Metric: MetricStub
    }))

    AgentStub.findConnected = sandbox.stub()
    AgentStub.findConnected.returns(Promise.resolve(agentMock.connected))

    AgentStub.findByUuid = sandbox.stub()
    AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agentMock.byUuid(uuid)))
    AgentStub.findByUuid.withArgs('yyysaodikajsd').returns(Promise.resolve(null))

    MetricStub.findByAgentUuid = sandbox.stub()
    MetricStub.findByAgentUuid.withArgs(id).returns(Promise.resolve([metricMock.byAgentId(id)]))
    MetricStub.findByAgentUuid.withArgs(100).returns(Promise.resolve(null))

    MetricStub.findByTypeAgentUuid = sandbox.stub()
    MetricStub.findByTypeAgentUuid.withArgs('cpu', '1').returns(Promise.resolve([metricMock.byType('cpu')]))
    MetricStub.findByTypeAgentUuid.withArgs('cpu', '100').returns(Promise.resolve(null))

    const api = proxyquire('../api', {
        'platziverse-db': dbStub
    })

    server = proxyquire('../', {
        './api': api
    })
})

test.afterEach(() => {
    sandbox && sinon.restore()
})

test.serial.cb('/api/agents', t => {
  supertest(server)
    .get('/api/agents')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      let expected = JSON.stringify({ agents: agentMock.connected })
      t.falsy(err, 'Should no return an error')
      t.deepEqual(JSON.stringify(res.body), expected, 'responds body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agent/:uuid', t => {
    supertest(server)
        .get(`/api/agent/${uuid}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            let expected = JSON.stringify({ agent: agentMock.byUuid(uuid) })
            t.falsy(err, 'Should no return an error')
            t.deepEqual(JSON.stringify(res.body), expected, 'responds body should be the expected')
            t.end()
        })
})

test.serial.cb('/api/agent/:uuid - not found', t => {
    supertest(server)
        .get(`/api/agent/yyysaodikajsd`)
        .expect(400)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            let expected = JSON.stringify({"error": {
                "statusCode": 400,
                "error": "Bad Request",
                "message": "Agent not found with Uuid: yyysaodikajsd"
              }})
            t.falsy(err, 'Should not return an error')
            t.deepEqual(JSON.stringify(res.body), expected, 'responds body should be the expected')
            t.end()
        })
})

test.serial.cb('/api/metrics/:uuid - not found', t => {
    supertest(server)
        .get(`/api/metrics/100`)
        .expect(422)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            let expected = JSON.stringify({
                "error": {
                  "statusCode": 422,
                  "error": "Unprocessable Entity",
                  "message": "That Agent does not have metrics"
                }
            })
            t.falsy(err, 'Should no return an error')
            t.deepEqual(JSON.stringify(res.body), expected, 'responds body should be the expected')
            t.end()
        })
})

test.serial.cb('/api/metrics/:uuid', t => {
    supertest(server)
        .get(`/api/metrics/${id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            let expected = JSON.stringify({ metrics: [metricMock.byAgentId(id)] })
            t.falsy(err, 'Should no return an error')
            t.deepEqual(JSON.stringify(res.body), expected, 'responds body should be the expected')
            t.end()
        })
})

test.serial.cb('/api/metrics/:uuid/:type', t => {
    supertest(server)
        .get(`/api/metrics/1/cpu`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            let expected = JSON.stringify({ metrics: [metricMock.byType('cpu')] })
            t.falsy(err, 'Should no return an error')
            t.deepEqual(JSON.stringify(res.body), expected, 'responds body should be the expected')
            t.end()
        })
})

test.serial.cb('/api/metrics/:uuid/:type - not found', t => {
    supertest(server)
        .get(`/api/metrics/100/cpu`)
        .expect(422)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            let expected = JSON.stringify({
                "error": {
                  "statusCode": 422,
                  "error": "Unprocessable Entity",
                  "message": "That Agent does not have metrics with that type!"
                }
              })
            t.falsy(err, 'Should no return an error')
            t.deepEqual(JSON.stringify(res.body), expected, 'responds body should be the expected')
            t.end()
        })
})