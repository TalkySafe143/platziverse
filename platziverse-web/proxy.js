'use strict'

const router = require('express').Router()
const axios = require('axios').default

const config = require('./config')

router.get('/agents', async (req, res, next) => {
    try {
        const { data, status } = await axios({
            'method': 'GET',
            'url': `${config.endpoint}/api/agents`,
            'headers': {
                'Authorization': `Bearer ${config.apiToken}`
            }
        })

        res.status(status).json(data)
    } catch(e) {
        return next(e)
    }
})

router.get('/agent/:uuid', async (req, res, next) => {
    const { uuid } = req.params

    try {
        const {} = await axios({
            'method': 'GET',
            'url': `${config.endpoint}/api/agent/${uuid}`,
            'headers': {
                'Authorization': `Bearer ${config.apiToken}`
            }
        })
    } catch(e) {
        return next(e)
    }
})

router.get('/metrics/:uuid', (req, res, next) => {
    const { uuid } = req.params

    try {
        const {} = await axios({
            'method': 'GET',
            'url': `${config.endpoint}/api/metrics/${uuid}`,
            'headers': {
                'Authorization': `Bearer ${config.apiToken}`
            }
        })
    } catch(e) {
        return next(e)
    }
})

router.get('/metrics/:uuid/:type', (req, res, next) => {
    const { uuid, type } = req.params

    try {
        const {} = await axios({
            'method': 'GET',
            'url': `${config.endpoint}/api/metrics/${uuid}/${type}`,
            'headers': {
                'Authorization': `Bearer ${config.apiToken}`
            }
        })
    } catch(e) {
        return next(e)
    }
})

module.exports = router