import slack from 'slack'
import moment from 'moment'
import status from '../main/status'

export default function triggerSlack() {
	status.on('statusStarts', function () {
		if (status.slackToken.length === 0) return

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
					"status_emoji": status.dnd ? ":no_bell:" : ":male-technologist:",
					"status_text": status.msg,
					status_expiration,
				})
			})
		}
	})

	status.on('statusEnds', function () {
		if (status.slackToken.length === 0) return

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
}