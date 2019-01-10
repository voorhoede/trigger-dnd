<template>
  <v-app>
    <v-toolbar flat color="transparent">
      <v-icon>none</v-icon>
      <v-spacer />
      <v-toolbar-title style="margin-left: 0;">Trigger DnD</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="openPreferences = true">
        <v-icon>settings</v-icon>
      </v-btn>
    </v-toolbar>

    <v-dialog v-model="openPreferences" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-spacer></v-spacer>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="openPreferences = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-list two-line subheader>
          
          <v-subheader>Defaults</v-subheader>
          <v-list-tile @click="">
            <v-list-tile-content>
              <v-list-tile-title>Duration</v-list-tile-title>
              <v-list-tile-sub-title>{{ status.duration }} minutes</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile @click="">
            <v-list-tile-content>
              <v-list-tile-title>Status message</v-list-tile-title>
              <v-list-tile-sub-title>{{ status.msg.length ? status.msg : 'None' }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider></v-divider>

          <v-subheader>Slack</v-subheader>
          <v-list-tile @click="">
            <v-list-tile-content>
              <v-list-tile-title>Enabled</v-list-tile-title>
              <v-list-tile-sub-title>Trigger Slacks Do Not Disturb feature</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-switch :value="true"></v-switch>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile @click="">
            <v-list-tile-content>
              <v-list-tile-title>Token</v-list-tile-title>
              <v-list-tile-sub-title>{{ status.slackToken.length ? status.slackToken : 'None' }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider></v-divider>

          <v-subheader>Mac OS</v-subheader>
          <v-list-tile @click="">
            <v-list-tile-content>
              <v-list-tile-title>Enabled</v-list-tile-title>
              <v-list-tile-sub-title>Trigger Mac OS Do Not Disturb feature</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-switch :value="true"></v-switch>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-dialog>
  <!--  
    <h1>
      DND status: {{ status.dnd }}
      <br>
      Message: {{ status.msg }}
      <br>
      Duration: {{ status.duration }}
      <br>
      End Time: {{ endTime }}
      <br>
      Remaining Time: {{ remainingTime }}
      <br>
      Token: {{ status.slackToken }}
    </h1>
    <button @click="activateDND">Activate DND</button>
    <button @click="deactivateDND">Deactivate DND</button>
    <button @click="toggleDND">Toggle DND</button>
    <button @click="startStatus">Start Status</button>
    <button @click="deactivateDND">Stop Status</button>
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
  -->
  </v-app>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import * as events from '../../events'
import moment from 'moment'

const channel = 'preferences'

export default {
  name: 'preferences',
  data () {
    return {
       status: {},
       openPreferences: true,
       defaultsOpen: true,
       slackOpen: true,
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
    startStatus() {
      ipcRenderer.send(channel, events.STATUS_ACTIVATE)
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
  },
  computed: {
    endTime() {
      return this.status.endTime > 0 
        ? moment(this.status.endTime).format('HH:mm:ss')
        : 0
    },
    remainingTime() {
      return this.status.remainingTime > 0 
        ? moment(this.status.remainingTime).format('mm:ss')
        : 0
    }
  },
}
</script>

