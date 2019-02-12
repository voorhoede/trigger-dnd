import { app } from 'electron'
import slack from 'slack'
import moment from 'moment'
import status from '../main/status'

export default function triggerSlack() {
	status.on('statusStarts', function () {
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
					"status_emoji": status.dnd ? ":no_bell:" : status.slackBusyIcon,
					"status_text": status.msg,
					status_expiration,
				})
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
				"status_emoji": null,
				"status_text": null
			})
		})
	})

	status.on('slackBusyIcon', function() {
		if (status.slackToken.length === 0 || status.slackEnabled === false) return
		
		const token = status.slackToken

		if (status.endTime && !status.dnd) {
			const status_expiration = moment.utc(status.endTime).unix()
			slack.users.profile.set({
				token,
				profile: JSON.stringify({
					"status_emoji": status.slackBusyIcon,
					"status_text": status.msg,
					status_expiration,
				})
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
					"status_emoji": null,
					"status_text": null
				})
			})
		]).then(() => {
			app.quit()
		})
		
	})
}