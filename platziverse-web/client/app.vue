<template>
  <div>
    <agent
      v-for="agent in agents"
      :uuid="agent.uuid"
      :key="agent.uuid"
      :socket="socket">
    </agent>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
  body {
    font-family: Arial;
    background: #f8f8f8;
    margin: 0;
  }
</style>

<script>
const io = require('socket.io-client')
const socket = io()
const axios = require('axios').default

module.exports = {
  data () {
    return {
      agents: [],
      error: null,
      socket
    }
  },

  mounted () {
    this.initialize()
  },

  methods: {
    async initialize () {
      let results

      try {
        results = await axios({
          method: 'GET',
          url: `http://localhost:8080/agents`
        })
      } catch(e) {
        this.error = e.message
        return
      }

      this.agents = results.data.agents

      socket.on('agent/connected', payload => {
        const { uuid } = payload.agent

        const existing = this.agents.find(agent => agent.uuid === uuid)

        if(!existing) {
          this.agents.push(payload.agent)
        }
      })
    }
  }
}
</script>
