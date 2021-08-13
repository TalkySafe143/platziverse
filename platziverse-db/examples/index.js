(async function () {
  const db = require('../')

  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'root',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }

  const { Agent, Metric } = await db(config).catch(err => {
    console.log(err.message)
    console.error(err.stack)
    process.exit(1)
  })

  const agent = await Agent.createOrUpdate({
    uuid: 'yyy-yyy-yyy',
    name: 'test',
    username: 'test',
    hostname: 'test',
    pid: 1,
    connected: true
  }).catch(err => {
    console.log(err.message)
    console.error(err.stack)
    process.exit(1)
  })

  console.log('--agent--')
  console.log(agent)

  const agents = await Agent.findAll().catch(err => {
    console.log(err.message)
    console.error(err.stack)
    process.exit(1)
  })

  console.log('--agents--')
  console.log(agents)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(err => {
    console.log(err.message)
    console.error(err.stack)
    process.exit(1)
  })

  console.log('--metrics--')
  console.log(metrics)

  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(err => {
    console.log(err.message)
    console.error(err.stack)
    process.exit(1)
  })

  console.log('--metric---')
  console.log(metric)

  const metricType = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(err => {
    console.log(err.message)
    console.error(err.stack)
    process.exit(1)
  })

  console.log('---metrics/type---')
  console.log(metricType)
})()
