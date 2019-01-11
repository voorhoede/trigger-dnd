<template>
  <div @keydown.esc="escPressed">
    <v-app>
      <v-toolbar flat color="transparent">
        <v-spacer />
        <v-btn icon @click="openPreferences = true">
          <v-icon>settings</v-icon>
        </v-btn>
      </v-toolbar>

      <v-layout align-center justify-center>
        <v-layout align-center justify-center>
          <v-btn
            v-if="!status.dnd"
            :color="status.dnd ? 'accent' : 'primary'"
            fab
            absolute
            style="transform: scale(4)"
            @click="activateDND">
            <v-icon>notifications_off</v-icon>
          </v-btn>
          <v-progress-circular
            v-if="status.dnd"
            :rotate="-90"
            :size="270"
            :width="15"
            :value="status.remainingTime / (status.duration * 1000 * 60) * 100"
            :color="status.dnd ? 'accent' : 'primary'"
          >
          <v-layout align-center justify-center column>
            <span>{{ remainingTime }}</span>
            <v-btn color="accent" @click="deactivateDND" flat>end now</v-btn>
          </v-layout>
          </v-progress-circular>
        </v-layout>
      </v-layout>

      <v-dialog 
        v-model="openPreferences"
        fullscreen
        transition="dialog-bottom-transition">
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
            <v-list-tile @click="modals.defaultDurationOpen = true">
              <v-list-tile-content>
                <v-list-tile-title>Duration</v-list-tile-title>
                <v-list-tile-sub-title>{{ status.duration }} minutes</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile @click="modals.defaultMsgOpen = true">
              <v-list-tile-content>
                <v-list-tile-title>Status message</v-list-tile-title>
                <v-list-tile-sub-title>{{ status.msg ? status.msg : 'None' }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-divider></v-divider>

            <v-subheader>Slack</v-subheader>
            <v-list-tile @click="toggleSlackEnabled" :disabled="!status.slackToken">
              <v-list-tile-content>
                <v-list-tile-title>Enabled</v-list-tile-title>
                <v-list-tile-sub-title>Trigger Slacks Do Not Disturb feature</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-switch :value="status.slackEnabled"></v-switch>
              </v-list-tile-action>
            </v-list-tile>
            <v-list-tile @click="modals.slackTokenOpen = true">
              <v-list-tile-content>
                <v-list-tile-title>Token</v-list-tile-title>
                <v-list-tile-sub-title>{{ status.slackToken ? status.slackToken : 'None' }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-divider></v-divider>

            <v-subheader>Mac OS</v-subheader>
            <v-list-tile @click="toggleOsEnabled">
              <v-list-tile-content>
                <v-list-tile-title>Enabled</v-list-tile-title>
                <v-list-tile-sub-title>Trigger Mac OS Do Not Disturb feature</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-switch :value="status.osEnabled"></v-switch>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-dialog>

      <transition>
        <over-overlay v-if="modals.defaultDurationOpen">
          <v-card>
            <v-toolbar flat color="transparent">
              <span class="headline">Default duration</span>
            </v-toolbar>
            <v-card-text>
              <p>Default duration in minutes</p>
              <v-layout row wrap justify-space-between>
                <v-flex xs9>
                  <v-slider
                    style="-webkit-app-region: no-drag;"
                    :value="status.duration"
                    :min="1"
                    :max="180"
                    @input="event => status.duration = event"
                    @change="changeDuration"
                  />
                </v-flex>

                <v-flex xs2>
                  <v-text-field
                    :value="status.duration"
                    class="mt-0"
                    type="number"
                    @change="changeDuration"
                  />
                </v-flex>
              </v-layout>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn flat @click="modals.defaultDurationOpen = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </over-overlay>
      </transition>

      <transition>
        <over-overlay v-if="modals.defaultMsgOpen">
          <v-card>
            <v-toolbar flat color="transparent">
              <span class="headline">Status message</span>
            </v-toolbar>
            <v-card-text>
              <p>The default message set when dnd is active</p>
              <v-text-field
                label="Default status message"
                persistent-hint
                :value="status.msg"
                @change="changeMsg"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn flat @click="modals.defaultMsgOpen = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </over-overlay>
      </transition>

      <transition>
        <over-overlay v-if="modals.slackTokenOpen">
          <v-card>
            <v-toolbar flat color="transparent">
              <span class="headline">Slack token</span>
            </v-toolbar>
            <v-card-text>
              <p>Your Slack token</p>
              <v-text-field
                label="Token"
                :value="status.slackToken"
                @change="changeSlackToken"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn flat @click="modals.slackTokenOpen = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </over-overlay>
      </transition>
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
  </div>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import * as events from '../../events'
import moment from 'moment'
import OverOverlay from './over-overlay'

const channel = 'preferences'

export default {
  name: 'preferences',
  components: {
    OverOverlay
  },
  data () {
    return {
      status: {},
      openPreferences: false,
      modals: {
        defaultDurationOpen: false,
        defaultMsgOpen: false,
        slackTokenOpen: false,
      }
    }
  },
  mounted() {
    ipcRenderer.on(events.CURRENT_STATUS, (event, status) => {
      Vue.set(this, 'status', status)
    })
    ipcRenderer.on(events.OPEN_PREFERENCES, (event, status) => {
      this.openPreferences = true
    })
    this.requestStatus()
    document.addEventListener('keydown', event => {
      if (event.keyCode === 188 && event.metaKey === true) {
        this.openPreferences = true
      }
    })
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
    toggleSlackEnabled() {
      ipcRenderer.send(channel, events.SLACK_ENABLED_TOGGLE)
    },
    toggleOsEnabled() {
      ipcRenderer.send(channel, events.OS_ENABLED_TOGGLE)
    },
    startStatus() {
      ipcRenderer.send(channel, events.STATUS_ACTIVATE)
    },
    changeMsg(value) {
      ipcRenderer.send(channel, events.MSG_CHANGE, value)
    },
    changeDuration(value) {
      ipcRenderer.send(channel, events.DURATION_CHANGE, value)
    },
    changeSlackToken(value) {
      ipcRenderer.send(channel, events.SLACK_TOKEN_CHANGE, value)
    },
    triggerOpenPreferences(event) {
      console.log('openPreferences')
      this.openPreferences = true
    },
    escPressed() {
      console.log('esc pressed')
      const openModals = Object.entries(this.modals).filter(([key, value]) => value)
      if (openModals.length) {
        openModals.forEach(([key]) => {
          this.modals[key] = false
        })
      } else {
        this.openPreferences = false
      }
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

