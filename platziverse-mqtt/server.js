'use strict'

const debug = require('debug')('platziverse:mqtt')

const aedes = require('aedes')
const mqemitter = require('mqemitter-redis')
const redisPersistence = require('aedes-persistence-redis')
const chalk = require('chalk')
const port = 1883

const db = require('platziverse-db')

const utils = require('./utils')

const handleFatalError = err => {
  console.log(`${chalk.red('[fatal error]')} ${err.message}`)
  console.log(err.stack)
  process.exit(1)
}

const handleError = err => {
  console.log(`${chalk.red('[Error]')} ${err.message}`)
  console.log(err.stack)
}

const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'root',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s)
}

let Agent, Metric

const clients = new Map()

const app = aedes.Server({
  mq: mqemitter({
    port: 6379,
    host: '127.0.0.1',
    family: 4
  }),
  persistence: redisPersistence({
    port: 6379,
    host: '127.0.0.1',
    family: 4
  })
})

app.on('clientReady', client => {
  debug(`Client connected: ${client.id}`)
  clients.set(client.id, null)
})

app.on('clientDisconnect', async client => {
  debug(`Client disconnected: ${client.id}`)

  const agent = clients.get(client.id)

  if (agent) {
    // Mark as disconnected
    agent.connected = false

    try {
      await Agent.createOrUpdate(agent)
    } catch (e) {
      return handleError(e)
    }

    // Delete the agent from the map
    clients.delete(client.id)

    app.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })

    debug(`Client (${client.id}) associated to Agent (${agent.uuid}) marked as disconnected`)
  }
})

app.on('publish', async (packet, client) => {
  debug(`Recieved: ${packet.topic}`)

  switch (packet.topic) {
    case 'agent/connected':
      break
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break
    case 'agent/message':
      debug(`Payload: ${packet.payload}`)

      const payload = utils.parsePayload(packet.payload)

      if (payload) {
        payload.agent.connected = true

        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }

        debug(`Agent ${agent.uuid} saved`)
        // Notificar a los usuarios que un nuevo agente se ha conectado
        if (!clients.get(client.id)) {
          const { uuid, name, hostname, pid, connected } = agent

          clients.set(client.id, agent)
          app.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid,
                name,
                hostname,
                pid,
                connected
              }
            })
          })

          // Store Metrics
          for (const metric of payload.metrics) {
            let m

            try {
              m = await Metric.create(agent.uuid, metric)
            } catch (e) {
              return handleError(e)
            }

            debug(`Metric ${m.id} saved on agent ${agent.uuid}!`)
          }
        }
      }
      break
  }
})

app.on('clientError', (client, error) => {
  console.log(`${chalk.red('[fatal error]')} ${error.message}`)
  console.log(error.stack)
  process.exit(1)
})

process.on('uncaughtException', handleFatalError)

process.on('unhandledRejection', handleFatalError)

const server = require('net').createServer(app.handle)

server.listen(port, async () => {
  const services = await db(config).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
})
