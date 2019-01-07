<template>
  <div>
    <h1>DND status: {{ status.dnd }}</h1>
    <button @click="activateDND">Activate DND</button>
    <button @click="deactivateDND">Deactivate DND</button>
    <button @click="toggleDND">Toggle DND</button>
  </div>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import * as events from '../../events'

const channel = 'preferences'

export default {
  name: 'preferences',
  data () {
    return {
       status: {}
    }
  },
  mounted() {
    ipcRenderer.on(events.CURRENT_STATUS, (event, status) => {
      Vue.set(this, 'status', status)
    })
    this.requestStatus()
  },
  methods: {
    requestStatus() {
      ipcRenderer.send(channel, events.REQUEST_STATUS)
    },
    activateDND() {
      ipcRenderer.send(channel, events.DND_ACTIVATE)
    },
    deactivateDND() {
      ipcRenderer.send(channel, events.DND_DEACTIVATE)
    },
    toggleDND() {
      ipcRenderer.send(channel, events.DND_TOGGLE)
    }
  }
}
</script>
