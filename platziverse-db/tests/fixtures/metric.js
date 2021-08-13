'use strict'

const { utilities } = require('./agent')

const metric = {
  id: 1,
  agentId: 1,
  type: 'cpu',
  value: '60%',
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  utilities.extend(metric, { id: 2, value: '80%' }),
  utilities.extend(metric, { id: 3, agentId: 2 }),
  utilities.extend(metric, { id: 4, type: 'memory', value: '20%' }),
  utilities.extend(metric, { id: 5, agentId: 3 }),
  utilities.extend(metric, { id: 6, value: '90%' })
]

module.exports = {
  single: metric,
  all: metrics,
  byType: type => metrics.find(metric => metric.type == 'type'),
  byId: id => metrics.find(metric => metric.id === id),
  byAgentId: id => metrics.find(metric => metric.agentId === id)
}
