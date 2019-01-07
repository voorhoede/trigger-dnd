import path from 'path'
import { Tray, Menu, systemPreferences } from 'electron'

const iconOffWhite = path.join(__dirname, '../assets/notification-off-small-white.png')
const iconOnWhite = path.join(__dirname, '../assets/notification-on-small-white.png')
const iconOffDark = path.join(__dirname, '../assets/notification-off-small-dark.png')
const iconOnDark = path.join(__dirname, '../assets/notification-on-small-dark.png')

let tray;
let dnd = false;

systemPreferences.subscribeNotification(
	'AppleInterfaceThemeChangedNotification',
	setIconToTray
)

export default function createTray(contextMenu) {
	const icon = getCorrectIcon()
  tray = new Tray(icon)
	tray.setContextMenu(contextMenu)
}

function getCorrectIcon() {
	if (dnd) {
		return systemPreferences.isDarkMode() 
			? iconOffWhite
			: iconOffDark
	} else {
		return systemPreferences.isDarkMode() 
			? iconOnWhite
			: iconOnDark
	}
}

function setIconToTray() {
	tray.setImage(getCorrectIcon())
}