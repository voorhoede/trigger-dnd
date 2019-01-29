import fs from 'fs'
import path from 'path'
import status from '../main/status'
import { google } from 'googleapis'
import { app, BrowserWindow } from 'electron'
import moment from 'moment'

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
const TOKEN_PATH = path.join(app.getPath('userData'), 'google-calendar-token.json')

export default function googleCalendar() {
	if (status.googleCalendarEnabled) {
		bootstrap(true)
	} else {
		status.on('googleCalendarEnabled', enabled => {
			if (enabled) {
				bootstrap()
			}
		})
	}
}

function bootstrap() {
	const { googleClientId, googleClientSecret, googleProjectId } = status

	if (!googleClientId) return console.error('No google client id')
	if (!googleClientSecret) return console.error('No google client secret')
	if (!googleProjectId) return console.error('No google project id')

	const credentials = {
    installed: {
			client_id: googleClientId,
			client_secret: googleClientSecret,
			project_id: googleProjectId,
			auth_uri: "https://accounts.google.com/o/oauth2/auth",
			token_uri: "https://www.googleapis.com/oauth2/v3/token",
			auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
			redirect_uris: ["http://localhost"]
    }
	}
	authorize(credentials, listEvents)

	setInterval(loop, 1000 * 1)
}

function authorize(credentials, callback) {
	const { client_secret, client_id, redirect_uris } = credentials.installed
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getAccessToken(oAuth2Client, callback)
		oAuth2Client.setCredentials(JSON.parse(token))
		callback(oAuth2Client)
})
}

function getAccessToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});

	let authWindow = new BrowserWindow({width: 800, height: 600, show: false, 'node-integration': false})
	authWindow.loadURL(authUrl)
	authWindow.show()

	function handleCallback(url) {
		const params = (new URL(url)).searchParams
		const code = params.get('code')
		const error = params.get('error')

		if (code || error) {
			authWindow.destroy()
		}

		if (code) {
			oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
		}

		if (error) {
			status.googleCalendarEnabled = false
		}
	}

	authWindow.webContents.on('will-navigate', (event, url) => {
		handleCallback(url)
	})

	authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
		handleCallback(newUrl)
	})

	authWindow.on('close', () => authWindow = null, false)
}

function listEvents(auth) {
	const calendar = google.calendar({version: 'v3', auth});
	calendar.events.list({
		calendarId: 'primary',
		timeMin: (new Date()).toISOString(),
		maxResults: 10,
		singleEvents: true,
		orderBy: 'startTime',
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const events = res.data.items.map(event => {
			event.start.unix = new Date(event.start.dateTime || event.start.date).getTime()
			event.end.unix = new Date(event.end.dateTime || event.end.date).getTime()
			return event
		});
		if (events.length) {
			events
				.forEach(item => status.googleCalendarEvents.push(item))
		}
	});
}

function loop() {
	// If we are in an active status, return
	if (status.endTime) return

	const now = new Date(Date.now()).getTime()
	const nearestEvent = status.googleCalendarEvents.reduce((previous, current) => {
		if (!previous) return current
		if (current.end.unix < new Date(Date.now()).getTime()) return previous

		return previous.start.unix < current.start.unix ? previous : current
	}, null)

	if (nearestEvent && nearestEvent.start.unix > now) {
		status.googleCalendarUntilNext = nearestEvent.start.unix - now
	}

	// Start status if 
	if (nearestEvent && nearestEvent.start.unix < now && nearestEvent.end.unix > now) {
		const now = new moment()
		const end = new moment(nearestEvent.end.unix)
		const dndToken = /(\s)?\[dnd\]/i;
		const dnd = dndToken.test(nearestEvent.summary)
		const duration = moment.duration(end.diff(now)).asMinutes()
		const msg = nearestEvent.summary.replace(dndToken, '')
		
		status.startStatus({ dnd, duration, msg, cancelable: false })
		status.googleCalendarUntilNext = null
	}
}