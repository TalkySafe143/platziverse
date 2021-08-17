'use strict'

const debug = require('debug')('platziverse:api:routes')
const router = require('express').Router()

router.get('/agents', (req, res, next) => {})

router.get('/agent/:uuid', (req, res, next) => {})

router.get('/metrics/:uuid', (req, res, next) => {})

router.get('/metrics/:uuid/:type', (req, res, next) => {})

module.exports = router