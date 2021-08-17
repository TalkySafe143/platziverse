'use strict'

const boom = require('@hapi/boom')
const debug = require('debug')('platziverse:api:routes')
const router = require('express').Router()
const db = require('platziverse-db')

const expressJwt = require('express-jwt')
const guard = require('express-jwt-permissions')()

const config = require('./config')

let services, Agent, Metric

router.use('*', async (req, res, next) => {
  debug('Connecting to database')
  if (!services) {
    try {
      services = await db(config.db)
    } catch (e) {
      return next(e)
    }
    Agent = services.Agent
    Metric = services.Metric
  }
  next()
})

router.get('/agents',expressJwt(config.auth) ,async (req, res, next) => {
  debug('A request come from /agents')

  const { user } = req

  if (!user || !user.username) {
    return next(boom.unauthorized())
  }

  let agents = []
  try {

    user.admin ?
    agents = await Agent.findConnected() :
    agents = await Agent.findByUsername(user.username);

  } catch (e) {
    return next(e)
  }

  res.json({ agents })
})

router.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  debug('Request to /agent/uuid')

  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if (!agent) {
    return next(boom.badRequest(`Agent not found with Uuid: ${uuid}`))
  }

  res.json({ agent })
})

router.get('/metrics/:uuid',expressJwt(config.auth), guard.check(['metrics:read']) ,async (req, res, next) => {
  const { uuid } = req.params

  debug('Request to /metrics/uuid')

  let metrics = []
  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if (!metrics) {
    return next(boom.badData('That Agent does not have metrics'))
  }

  res.json({ metrics })
})

router.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params

  debug('Request to /metrics/uuid/type')

  let metrics = []

  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (e) {
    return next(e)
  }

  if (!metrics || metrics.length === 0) {
    return next(boom.badData('That Agent does not have metrics with that type!'))
  }

  res.json({ metrics })
})

module.exports = router
