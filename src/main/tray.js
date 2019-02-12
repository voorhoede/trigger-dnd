import path from 'path'
import { Tray, Menu, systemPreferences } from 'electron'
import status from './status'

const iconOffWhite = path.join(__dirname, '../assets/off.png')
const iconOnWhite = path.join(__dirname, '../assets/on-white.png')
const iconOnBlue = path.join(__dirname, '../assets/on-blue.png')
const iconOffDark = path.join(__dirname, '../assets/off.png')
const iconOnDark = path.join(__dirname, '../assets/on-black.png')

let tray;

systemPreferences.subscribeNotification(
	'AppleInterfaceThemeChangedNotification',
	setIconToTray
)

status.on('statusStarts', setIconToTray)
status.on('statusEnds', setIconToTray)

export default function createTray(contextMenu) {
	const icon = getCorrectIcon()
	tray = new Tray(icon)
	tray.setContextMenu(contextMenu)
	return tray
}

function getCorrectIcon() {
	if (status.dnd) {
		return systemPreferences.isDarkMode() 
			? iconOffWhite
			: iconOffDark
	} else if (status.endTime) {
		return iconOnBlue
	} else {
		return systemPreferences.isDarkMode() 
			? iconOnWhite
			: iconOnDark
	}
}

function setIconToTray() {
	tray.setImage(getCorrectIcon())
}