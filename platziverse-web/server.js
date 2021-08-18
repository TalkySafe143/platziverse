'use strict'

const debug = require('debug')('platziverse:web')
const http = require('http')
const express = require('express')
const chalk = require('chalk')
const socketIo = require('socket.io')
const proxy = require('./proxy')

const PlatziverseAgent = require('platziverse-agent')
const { pipe } = require('./utils')

const path = require('path')

const port = process.env.PORT || 8080

const app = express()
const server = http.createServer(app)
const io = socketIo(server)
const agent = new PlatziverseAgent()

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', proxy)

// Web socket
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)

  pipe(agent, socket)
})

const handleFatalError = err => {
  console.log(`${chalk.red('[fatal error]')} ${err.message}`)
  console.log(err.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('[platziverse-web]')} is listening on port: ${port}`)
  agent.connect()
})
