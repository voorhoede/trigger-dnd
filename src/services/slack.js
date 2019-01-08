import slack from 'slack'
import status from '../main/status'

export default function triggerSlack() {
	status.on('dnd', async function (dnd) {
		if (status.slackToken.length === 0) return

		let token = status.slackToken
		let num_minutes = 2

		Promise.resolve(dnd 
				? slack.dnd.setSnooze({ token, num_minutes })
				: slack.dnd.endDnd({ token: status.slackToken })
		)
		.then(function ({ snooze_endtime }) {
			const setProfile = JSON.stringify({
				"status_emoji": status.dnd ? ":no_bell:" : ":male-technologist:",
				"status_text": status.msg,
				"status_expiration": snooze_endtime
			})
			const clearProfile = JSON.stringify({
				"status_emoji": null,
				"status_text": null,
			})

			return slack.users.profile.set({
				token: status.slackToken,
				profile: status.msg.length ? setProfile : clearProfile
			})
		})
		.catch(function (error) {
			console.error(error)
		})

		

		// if (status.msg.length) {
		// 	slack.users.profile.set({
		// 		token: status.slackToken,
		// 		profile: JSON.stringify({
		// 			"status_emoji": status.dnd ? ":no_bell:" : ":male-technologist:",
		// 			"status_text": status.msg,
		// 		})
		// 	}).catch(console.log)
		// } else {
		// 	slack.users.profile.set({
		// 		token: status.slackToken,
		// 		profile: JSON.stringify({
		// 			"status_emoji": null,
		// 			"status_text": null,
		// 		})
		// 	}).catch(console.log)
		// }
	})
}