<template>
  <div @keydown.esc="escPressed">
    <v-app
      :dark="status.dark"
      :style="{
        'background-color': status.dark ? '#263238' : 'transparent'
      }">
      <v-toolbar flat color="transparent">
        <v-spacer />
        <v-btn icon @click="openPreferences = true">
          <v-icon :color="status.dark ? 'primary' : 'accent'">settings</v-icon>
        </v-btn>
      </v-toolbar>

      <v-layout align-center justify-center>
        <v-layout align-center justify-center>
          <v-btn
            v-if="!status.endTime"
            color="accent"
            fab
            absolute
            style="transform: scale(4)"
            @click="activateDND">
            <v-icon color="primary" style="transform: scale(1.25)">notifications_off</v-icon>
          </v-btn>
          <v-progress-circular
            v-if="status.endTime"
            :rotate="-90"
            :size="270"
            :width="15"
            :value="status.remainingTime / (status.duration * 1000 * 60) * 100"
            color="accent"
          >
          <v-layout align-center justify-center column>
            <span :class="status.dark ? 'primary--text' : 'accent--text'">{{ remainingTime }}</span>
            <v-btn 
              v-if="status.cancelable"
              :color="status.dark ? 'primary' : 'accent'"
              @click="deactivateDND" flat>
              end now
            </v-btn>
          </v-layout>
          </v-progress-circular>
        </v-layout>
      </v-layout>

      <v-footer color="transparent" class="pa-3">
        <span
          style="opacity: 0.25">
          Trigger DnD <small>(v{{ status.version }})</small>
        </span>
        <v-spacer />
        <span
          v-if="
            !endTime &&
            googleCalendarUntilNext &&
            status.googleCalendarUntilNext < 1000 * 60 * 120
          "
          style="opacity: 0.25">
          Until next status: {{ googleCalendarUntilNext }}
        </span>
        <span
          v-if="endTime"
          style="opacity: 0.25">
          {{ status.msg }}
        </span>
      </v-footer>

      <v-dialog 
        v-model="openPreferences"
        fullscreen
        transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar color="primary" light fixed>
            <v-spacer></v-spacer>
            <v-toolbar-title>Settings</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="openPreferences = false">
              <v-icon>close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-list
            two-line
            subheader
            :style="{
              'padding-top': '4rem',
              'background-color': status.dark ? '#263238' : null
            }">
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
              <v-list-tile-action style="min-width: 0;">
                <v-switch :color="status.dark ? 'primary': 'accent'" :value="status.slackEnabled"></v-switch>
              </v-list-tile-action>
            </v-list-tile>
            <v-list-tile @click="modals.slackTokenOpen = true">
              <v-list-tile-content>
                <v-list-tile-title>Token</v-list-tile-title>
                <v-list-tile-sub-title>{{ status.slackToken ? status.slackToken : 'None' }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile @click="modals.slackIcon = true">
              <v-list-tile-content>
                <v-list-tile-title>Busy icon</v-list-tile-title>
                <v-list-tile-sub-title>{{ status.slackBusyIcon ? status.slackBusyIcon : 'None' }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-divider></v-divider>

            <v-subheader>Mac OS</v-subheader>
            <v-list-tile @click="toggleOsEnabled">
              <v-list-tile-content>
                <v-list-tile-title>Enabled</v-list-tile-title>
                <v-list-tile-sub-title>Trigger Mac OS Do Not Disturb feature</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action style="min-width: 0;">
                <v-switch :color="status.dark ? 'primary': 'accent'" :value="status.osEnabled"></v-switch>
              </v-list-tile-action>
            </v-list-tile>

            <v-divider></v-divider>

            <v-subheader>Google Calendar</v-subheader>
            <v-list-tile @click="() => toggleStatusValue('googleCalendarEnabled')">
              <v-list-tile-content>
                <v-list-tile-title>Enabled</v-list-tile-title>
                <v-list-tile-sub-title>Use Google Calendar events as DnD trigger</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action style="min-width: 0;">
                <v-switch :color="status.dark ? 'primary': 'accent'" :value="status.googleCalendarEnabled"></v-switch>
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

      <transition>
        <over-overlay v-if="modals.slackIcon">
          <v-card>
            <v-toolbar flat color="transparent">
              <span class="headline">Slack Busy icon</span>
            </v-toolbar>
            <v-card-text>
              <p>Icon in Slack for when you are busy but not in DnD</p>
              <v-text-field
                label="Busy icon"
                :value="status.slackBusyIcon"
                @change="event => changeStatusValue('slackBusyIcon', event)"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn flat @click="modals.slackIcon = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </over-overlay>
      </transition>

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
        slackIcon: false,
      }
    }
  },
  mounted() {
    ipcRenderer.send(events.APP_MOUNTED)
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
    toggleStatusValue(property) {
      ipcRenderer.send(channel, events.REQUEST_STATUS_PROP_CHANGE, property, !this.status[property])
    },
    changeStatusValue(property, value) {
      ipcRenderer.send(channel, events.REQUEST_STATUS_PROP_CHANGE, property, value)
    },
    triggerOpenPreferences(event) {
      this.openPreferences = true
    },
    escPressed() {
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
    },

    remainingTime() {
      return this.status.remainingTime > 0 
        ? moment(this.status.remainingTime).format('mm:ss')
        : 0
    },
    googleCalendarUntilNext() {
      return this.status.googleCalendarUntilNext > 0 
        ? moment.utc(this.status.googleCalendarUntilNext).format('HH:mm:ss')
        : 0
    },
  },
}
</script>

