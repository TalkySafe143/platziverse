const PlatziverseAgent = require('../')

function handler (payload) {
  console.log(payload)
}

const agent = new PlatziverseAgent({
  name: 'myapp',
  interval: 2000,
  username: 'admin'
})

agent.addMetric('rss', function getRss () { // Resident Set Size (Memory)
  return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getRandomPromise () {
  return new Promise((resolve, reject) => {
    resolve(Math.random())
  })
})

agent.addMetric('callbackMetric', function randomCallback (callback) {
  setTimeout(() => {
    callback(null, Math.random())
  }, 1000)
})

agent.connect()

// This agent only
agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)

// Messages from MQTT server
agent.on('agent/connected', handler)
agent.on('agent/disconnected', handler)
agent.on('agent/message', handler)
