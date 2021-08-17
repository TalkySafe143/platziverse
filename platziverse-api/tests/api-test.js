'use strict'

const test = require('ava')
const supertest = require('supertest')
const server = require('../server')

test.serial.cb('/api/agents', t => {
  supertest(server)
    .get('/api/agents')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Should no return an error')
      t.deepEqual(res.body, { prueba: 'si' }, 'responds body should be the expected')
      t.end()
    })
})
