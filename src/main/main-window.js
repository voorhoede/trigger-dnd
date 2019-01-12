import { BrowserWindow, systemPreferences } from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import * as events from '../events'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// let mainWindow;
let mainWindow;

const createWindow = async (isDevMode) => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 350,
		height: 500,
		webPreferences: {
			nodeIntegration: true,
		},
		show: true,
		titleBarStyle: 'hiddenInset'
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