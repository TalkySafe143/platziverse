'use strict'

const debug = require('debug')('platziverse-mqtt')
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

const server = require('net').createServer(app.handle)

server.listen(port, () => {
    console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
})