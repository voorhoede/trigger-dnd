import { app } from 'electron'
import doNotDisturb from '@sindresorhus/do-not-disturb'
import status from '../main/status'

export default function () {
	status.on('dndStarts', () => {
		if (status.osEnabled) {
			doNotDisturb.enable()
		}
	})
	status.on('dndEnds', () => {
		if (status.osEnabled) {
			doNotDisturb.disable()
		}
	})

	app.once('before-quit', async event => {
		event.preventDefault()

		doNotDisturb.isEnabled()
			.then(isEnabled => isEnabled && doNotDisturb.disable())
			.then(() => app.quit())
	})
}