'use strict'

const debug = require('debug')('platziverse:mqtt')
const redis = require('redis')

const aedes = require('aedes')
const mqemitter = require('mqemitter-redis')
const redisPersistence = require('aedes-persistence-redis')
const chalk = require('chalk')
const port = 1883

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
})

app.on('clientDisconnect', client => {
    debug(`Client disconnected: ${client.id}`)
})

app.on('publish', (packet, client) => {
    debug(`Recieved: ${packet.topic}`)
    debug(`Payload: ${packet.payload}`)
})

app.on('clientError', (client, error) => {
    console.log(`${chalk.red('[fatal error]')} ${error.message}`)
    console.log(error.stack)
    process.exit(1)
})

process.on('uncaughtException', err => {
    console.log(`${chalk.red('[fatal error]')} ${err.message}`)
    console.log(err.stack)
    process.exit(1)
})

process.on('unhandledRejection', err => {
    console.log(`${chalk.red('[fatal error]')} ${err.message}`)
    console.log(err.stack)
    process.exit(1)
})

const server = require('net').createServer(app.handle)

server.listen(port, () => {
    console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
})