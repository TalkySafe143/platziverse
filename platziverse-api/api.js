'use strict'

const boom = require('@hapi/boom')
const debug = require('debug')('platziverse:api:routes')
const router = require('express').Router()

router.get('/agents', (req, res, next) => {
  debug('A request come from /agents')

  res.json({ prueba: 'si' })
})

router.get('/agent/:uuid', (req, res, next) => {
  const { uuid } = req.params

  res.json({ uuid })
})

router.get('/metrics/:uuid', (req, res, next) => {
  const { uuid } = req.params

  res.json({ uuid })
})

router.get('/metrics/:uuid/:type', (req, res, next) => {
  const { uuid, type } = req.params

  res.json({
    uuid,
    type
  })
})

module.exports = router
