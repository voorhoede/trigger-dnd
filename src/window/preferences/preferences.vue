<template>
  <div>
    <h1>
      DND status: {{ status.dnd }}
      <br>
      Message: {{ status.msg }}
      <br>
      Duration: {{ status.duration }}
      <br>
      End Time: {{ status.endTime }}
      <br>
      Remaining Time: {{ status.remainingTime }}
      <br>
      Token: {{ status.slackToken }}
    </h1>
    <button @click="activateDND">Activate DND</button>
    <button @click="deactivateDND">Deactivate DND</button>
    <button @click="toggleDND">Toggle DND</button>
    <hr />
    <label>
      <span>message:</span>
      <input type="text" :value="status.msg" @change="changeMsg" :disabled="status.dnd"/>
    </label>
    <hr />
    <label>
      <span>duration:</span>
      <input type="text" :value="status.duration" @change="changeDuration" :disabled="status.dnd"/>
    </label>
    <hr />
    <label>
      <span>Slack token:</span>
      <input type="text" :value="status.slackToken" @change="changeSlackToken"/>
    </label>
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
    },
    changeMsg(event) {
      ipcRenderer.send(channel, events.MSG_CHANGE, event.target.value)
    },
    changeDuration(event) {
      ipcRenderer.send(channel, events.DURATION_CHANGE, event.target.value)
    },
    changeSlackToken(event) {
      ipcRenderer.send(channel, events.SLACK_TOKEN_CHANGE, event.target.value)
    },
  }
}
</script>