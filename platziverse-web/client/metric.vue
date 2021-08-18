<template>
  <div class="metric">
    <h3 class="metric-type">{{ type }}</h3>
    <line-chart
      :chart-data="datacollection"
      :options="{ responsive: true }"
      :width="400" :height="200"
    ></line-chart>
    <p v-if="error">{{error}}</p>
  </div>
</template>
<style>
  .metric {
    border: 1px solid white;
    margin: 0 auto;
  }
  .metric-type {
    font-size: 28px;
    font-weight: normal;
    font-family: 'Roboto', sans-serif;
  }
  canvas {
    margin: 0 auto;
  }
</style>
<script>
const LineChart = require('./line-chart')
const axios = require('axios').default
const moment = require('moment')
const randomColor = require('random-material-color')

module.exports = {
  name: 'metric',
  components: {
    LineChart
  },
  props: [ 'uuid', 'type', 'socket' ],

  data() {
    return {
      datacollection: {},
      error: null,
      color: null
    }
  },

  mounted() {
    this.initialize()
  },

  methods: {
    async initialize() {
      const { type, uuid } = this

      this.color = randomColor.getColor()

      let result

      try {
        result = await axios({
          url: `http://localhost:8080/metrics/${uuid}/${type}`,
          method: 'GET'
        })
      } catch(e) {
        this.error = e.message
        return
      }

      const labels = []
      const data = []

      if (Array.isArray(result.data.metrics)) {
        result.data.metrics.forEach(metric => {
          labels.push(moment(metric.createdAt).format('HH:mm:ss'))
          data.push(metric.value)
        })
      }

      this.datacollection = {
        labels,
        datasets: [{
          backgroundColor: this.color,
          label: type,
          data
        }]
      }

      this.startRealtime()
    },

    startRealtime(){
      const { type, uuid, socket } = this

      socket.on('agent/message', payload => {
        if (payload.agent.uuid === uuid) {
          const metric = payload.metrics.find(metric => metric.type === type)

          // Copy current values
          const labels = this.datacollection.labels
          const data = this.datacollection.datasets[0].data

          const length = labels.length || data.length

          if (length >= 20) {
            labels.shift()
            data.shift()
          }

          // Add new elements
          labels.push(moment(metric.createdAt).format('HH:mm:ss'))
          data.push(metric.value)

          this.datacollection = {
            labels,
            datasets: [{
              backgroundColor: this.color,
              label: type,
              data
            }]
          }
        }
      })
    },

    handleError (err) {
      this.error = err.message
    }
  }
}
</script>
