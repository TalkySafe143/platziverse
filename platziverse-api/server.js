'use strict'

const http = require('http')
const express = require('express')
const chalk = require('chalk')
const debug = require('debug')('platziverse:api')

const routerApi = require('./api')
const boom = require('@hapi/boom')

const handleFatalError = err => {
  console.log(`${chalk.red('[fatal error]')} ${err.message}`)
  console.log(err.stack)
}

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)

app.use('/api', routerApi)

// Not found
app.use((req, res) => {
  const { output: error } = boom.notFound('Lo siento, esta ruta no ha sido implementada')

  return res.status(error.statusCode).json(error.payload)
})

// Express error handler
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (!boom.isBoom(err)) {
    err = boom.badImplementation()
  }

  return res.status(err.output.statusCode).json({
    error: err.output.payload
  })
})

if (!module.parent) {
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  server.listen(port, () => {
    console.log(`${chalk.green('[platziverse-api]')} server listening on port: ${port}`)
  })
} else {
  console.log('Hola, me estoy exportando y no estoy en el server:)')
  module.exports = server
}
