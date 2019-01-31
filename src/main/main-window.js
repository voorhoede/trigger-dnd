import path from 'path'
import { app, BrowserWindow, systemPreferences, Menu } from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import * as events from '../events'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// let mainWindow;
let mainWindow;

const menuTemplate = [
	{
		label: app.getName(),
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },
			{ role: 'services' },
			{ type: 'separator' },
			{ role: 'hide' },
			{ role: 'hideothers' },
			{ role: 'unhide' },
			{ type: 'separator' },
			{ role: 'quit' }
		]
	},
	{
	  label: 'Edit',
	  submenu: [
		{ role: 'cut' },
		{ role: 'copy' },
		{ role: 'paste' },
		{ role: 'delete' },
		{ role: 'selectall' }
	  ]
	},
	{
	  label: 'View',
	  submenu: [
		{ role: 'reload' },
		{ role: 'forcereload' },
		{ role: 'toggledevtools' },
		{ type: 'separator' },
		{ role: 'resetzoom' },
		{ role: 'zoomin' },
		{ role: 'zoomout' },
		{ type: 'separator' },
		{ role: 'togglefullscreen' }
	  ]
	},
	{
	  role: 'window',
	  submenu: [
		{ role: 'minimize' },
		{ role: 'close' }
	  ]
	},
	{
	  role: 'help',
	  submenu: [
		{
		  label: 'Learn More',
		  click () { require('electron').shell.openExternal('https://electronjs.org') }
		}
	  ]
	}
]

const createWindow = async (isDevMode) => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 350,
		height: 500,
		webPreferences: {
			nodeIntegration: true,
		},
		show: isDevMode,
		titleBarStyle: 'hiddenInset',
	});

	// and load the index.html of the app.
	mainWindow.loadURL(`file:///${__dirname}/../window/preferences/index.html`);

	// Open the DevTools.
	if (isDevMode) {
		await installExtension(VUEJS_DEVTOOLS);
		// mainWindow.webContents.openDevTools();
	}

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
	
	const menu = Menu.buildFromTemplate(menuTemplate)
	// Menu.setApplicationMenu(menu)
	
	return mainWindow
};

export function activate(isDevMode) {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow(isDevMode)
	}
}

export async function show(isDevMode) {
	if (mainWindow) {
		mainWindow.show()
	} else {
		mainWindow = await createWindow(isDevMode)
	}
}

export function hide() {
	mainWindow.hide()
}

export function openPreferences() {
	mainWindow.send(events.OPEN_PREFERENCES)
}

export default createWindow;