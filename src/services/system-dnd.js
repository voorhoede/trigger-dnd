import doNotDisturb from '@sindresorhus/do-not-disturb'
import status from '../main/status'

export default function () {
	status.on('dndStarts', doNotDisturb.enable)
	status.on('dndEnds', doNotDisturb.disable)
}