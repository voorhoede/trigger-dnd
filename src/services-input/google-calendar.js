import fs from 'fs'
import path from 'path'
import status from '../main/status'
import { google } from 'googleapis'
import { app, BrowserWindow } from 'electron'
import moment from 'moment'
import dotenv from 'dotenv'
import emojiTree from 'emoji-tree'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
const TOKEN_PATH = path.join(
  app.getPath('userData'),
  'google-calendar-token.json',
)
let hasBootstrapped = false
const noop = () => {}

export default function googleCalendar() {
  if (status.googleCalendarEnabled) {
    bootstrap(true)
  } else {
    status.on('googleCalendarEnabled', (enabled) => {
      if (enabled) {
        bootstrap()
      }
    })
  }
}

status.on('googleCalendarEnabled', (enabled) => {
  if (!enabled) {
    status.googleCalendarEvents.splice(0, status.googleCalendarEvents.length)
    status.googleCalendarUntilNext = null
  } else {
    bootstrap(enabled)
  }
})

function bootstrap() {
  if (hasBootstrapped) return
  hasBootstrapped = true
  status.googleToken === '' && getEvents().catch(noop)
  setInterval(loop, 1000 * 1)
  setInterval(loopFetchingNewEvents, 1000 * 60 * 15)
}

async function getEvents() {
  const credentials = {
    installed: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      project_id: process.env.GOOGLE_PROJECT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://www.googleapis.com/oauth2/v3/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      redirect_uris: ['http://localhost'],
    },
  }
  return authorize(credentials, listEvents).catch(noop)
}

function authorize(credentials, callback) {
  return new Promise((resolve, reject) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    )

    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        reject(err)
        return getAccessToken(oAuth2Client, callback)
      }
      status.googleToken = token
      oAuth2Client.setCredentials(JSON.parse(token))
      callback(oAuth2Client).then(resolve).catch(noop)
    })
  })
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })

  let authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    'node-integration': false,
  })
  authWindow.loadURL(authUrl)
  authWindow.show()

  function handleCallback(url) {
    const params = new URL(url).searchParams
    const code = params.get('code')
    const error = params.get('error')

    if (code || error) {
      authWindow.destroy()
    }

    if (code) {
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err)
        oAuth2Client.setCredentials(token)
        status.googleToken = token
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) console.error(err)
          console.log('Token stored to', TOKEN_PATH)
        })
        callback(oAuth2Client).catch(noop)
      })
    }

    if (error) {
      status.googleCalendarEnabled = false
    }
  }

  authWindow.webContents.on('will-navigate', (event, url) => {
    handleCallback(url)
  })

  authWindow.webContents.on('will-redirect', (event, url) => {
    handleCallback(url)
  })

  authWindow.on(
    'close',
    () => {
      if (!status.googleToken) {
        hasBootstrapped = false
        status.googleCalendarEnabled = false
      }
      authWindow = null
    },
    false,
  )
}

async function listEvents(auth) {
  return new Promise((resolve, reject) => {
    if (status.googleCalendarIsFetching) {
      resolve()
      return console.log('Google calendar is fetching, aborting')
    }

    const calendar = google.calendar({ version: 'v3', auth })
    status.googleCalendarIsFetching = true

    calendar.events.list(
      {
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      },
      (err, res) => {
        status.googleCalendarIsFetching = false
        if (err) {
          reject('The API returned an error: ' + err)
          return console.log('The API returned an error: ' + err)
        }
        const events = res.data.items
          .filter((event) => {
            if (status.googleCalendarDndOnly) {
              const emojiObj = emojiTree(event.summary).find(
                ({ type }) => type === 'emoji',
              )
              const emoji = emojiObj ? emojiObj.text : undefined
              const dndToken = /(\s)?\[dnd\]/i
              return dndToken.test(event.summary) || emoji === '🔕'
            } else {
              return true
            }
          })
          .map((event) => {
            event.start.unix = new Date(
              event.start.dateTime || event.start.date,
            ).getTime()
            event.end.unix = new Date(
              event.end.dateTime || event.end.date,
            ).getTime()
            return event
          })
        if (events.length) {
          const nextEvent = getNextEvent()
          if (!nextEvent) {
            events.forEach((item) => status.googleCalendarEvents.push(item))
          } else if (
            nextEvent.start.unix !== events[0].start.unix ||
            nextEvent.end.unix !== events[0].end.unix
          ) {
            status.googleCalendarEvents.splice(
              0,
              status.googleCalendarEvents.length,
            )
            events.forEach((item) => status.googleCalendarEvents.push(item))
          }
          resolve(nextEvent)
          return
        }
        resolve()
      },
    )
  })
}

function loopFetchingNewEvents() {
  if (!status.googleCalendarEnabled || status.googleToken === '') {
    return
  }

  getEvents().catch(noop)
}

function loop() {
  if (!status.googleCalendarEnabled || status.googleToken === '') {
    return
  }

  const now = new Date(Date.now()).getTime()
  const nextEvent = getNextEvent()

  if (nextEvent === null) {
    getEvents().catch(noop)
  }

  // If we have a nextEvent and it is in the future
  if (nextEvent && nextEvent.start.unix > now) {
    status.googleCalendarUntilNext = nextEvent.start.unix - now
  }

  // If we have a nextEvent and it is now
  if (nextEvent && nextEvent.start.unix < now && nextEvent.end.unix > now) {
    if (!status.endTime) {
      const emojiObj = emojiTree(nextEvent.summary).find(
        ({ type }) => type === 'emoji',
      )
      const emoji = emojiObj ? emojiObj.text : undefined
      const now = new moment()
      const end = new moment(nextEvent.end.unix)
      const dndToken = /(\s)?\[dnd\]/i
      const dnd = dndToken.test(nextEvent.summary) || emoji === '🔕'
      const duration = moment.duration(end.diff(now)).asMinutes()
      const msg = nextEvent.summary.replace(dndToken, '').replace(emoji, '')

      status.startStatus({ dnd, duration, msg, cancelable: false, emoji })
      status.googleCalendarUntilNext = null
    }
  }

  // If we have a nextEvent and it is in the past
  if (nextEvent && nextEvent.end.unix < now) {
    status.googleCalendarEvents.splice(0, status.googleCalendarEvents.length)
  }
}
export const getCalendarEvents = () =>
  getEvents()
    .then(loop)
    .catch((err) => console.log('getCalendarEvents failed', err))

function getNextEvent() {
  return status.googleCalendarEvents.reduce((previous, current) => {
    if (!previous) return current
    if (current.end.unix < new Date(Date.now()).getTime()) return previous

    return previous.start.unix < current.start.unix ? previous : current
  }, null)
  return
}
