import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import slack from 'slack'
import moment from 'moment'
import dotenv from 'dotenv'
import status from '../main/status'
import { SLACK_ENABLED_TOGGLE } from '../events'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const {
  SLACK_CLIENT_ID: client_id,
  SLACK_CLIENT_SECRET: client_secret,
} = process.env
const redirect_url = 'http://localhost'

async function checkTokenValidity() {
  try {
    await slack.auth.test({ token: status.slackToken })
    return true
  } catch (err) {
    return false
  }
}

ipcMain.on('preferences', async function (event, eventName) {
  if (
    eventName === SLACK_ENABLED_TOGGLE &&
    !status.slackEnabled &&
    (!status.slackToken || !(await checkTokenValidity()))
  ) {
    const authUrlParams = new URLSearchParams({
      client_id,
      scope: 'dnd:write,users.profile:write',
      redirect_url,
    })
    const authUrl = `https://slack.com/oauth/authorize?${authUrlParams}`

    const authWindow = new BrowserWindow({
      width: 800,
      height: 800,
      show: false,
      'node-integration': false,
    })

    authWindow.loadURL(authUrl)
    authWindow.show()

    async function handleCallback(url) {
      const params = new URL(url).searchParams
      const code = params.get('code')
      const error = params.get('error')

      if (code || error) {
        authWindow.destroy()
      }

      if (code) {
        const slackAcessResponse = await slack.oauth.access({
          client_id,
          client_secret,
          code,
        })

        status.slackToken = slackAcessResponse.access_token
      }

      if (error) {
        status.slackEnabled = false
      }
    }

    authWindow.webContents.on('will-navigate', (event, url) => {
      handleCallback(url)
    })

    authWindow.webContents.on('will-redirect', (event, url) => {
      handleCallback(url)
    })
  }
})

export default function triggerSlack() {
  status.on('statusStarts', function ({ emoji }) {
    if (status.slackToken.length === 0 || status.slackEnabled === false) return

    const token = status.slackToken
    const num_minutes = Math.abs(moment().diff(status.endTime, 'minutes')) + 1
    const status_expiration = moment.utc(status.endTime).unix()

    if (status.dnd) {
      slack.dnd.setSnooze({ token, num_minutes })
    }

    if (status.msg) {
      slack.users.profile.set({
        token: status.slackToken,
        profile: JSON.stringify({
          status_emoji: status.dnd
            ? ':no_bell:'
            : emoji || status.slackBusyIcon,
          status_text: status.msg,
          status_expiration,
        }),
      })
    }
  })

  status.on('statusEnds', function () {
    if (status.slackToken.length === 0 || status.slackEnabled === false) return

    const token = status.slackToken

    slack.dnd.endDnd({ token })
    slack.users.profile.set({
      token,
      profile: JSON.stringify({
        status_emoji: null,
        status_text: null,
      }),
    })
  })

  status.on('slackBusyIcon', function () {
    if (status.slackToken.length === 0 || status.slackEnabled === false) return

    const token = status.slackToken

    if (status.endTime && !status.dnd) {
      const status_expiration = moment.utc(status.endTime).unix()
      slack.users.profile.set({
        token,
        profile: JSON.stringify({
          status_emoji: status.slackBusyIcon,
          status_text: status.msg,
          status_expiration,
        }),
      })
    }
  })

  app.once('before-quit', async function (event) {
    if (status.slackToken.length === 0 || status.slackEnabled === false) return
    const token = status.slackToken

    event.preventDefault()

    Promise.all([
      slack.dnd.endDnd({ token }),
      slack.users.profile.set({
        token,
        profile: JSON.stringify({
          status_emoji: null,
          status_text: null,
        }),
      }),
    ]).then(() => {
      app.quit()
    })
  })
}
