import path from 'path'
import { app, BrowserWindow, Tray, Menu, session, ipcMain } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import createMainWindow, { activate as activateMainWindow } from './main/main-window'
import tray from './main/tray'
import { activate } from './main/main-window';
import * as events from './events'
import status, { sendCurrentStatus } from './main/status'

const isDevMode = process.execPath.match(/[\\/]electron/);
const contextMenu = Menu.buildFromTemplate([
  {
    label: 'Set dnd',
    accelerator: 'Command+T',
	},
  { type: 'separator' },
	{
    label: 'Preferences',
    accelerator: 'Command+,',
	},
	{ type: 'separator' },
	{ label: 'Quit TriggerDND',
		accelerator: 'Command+Q',
		selector: 'terminate:',
	}
])

if (isDevMode) enableLiveReload();

app.on('ready', () => {
  if (!isDevMode) {
  // Hide dock icon, not needed for tray application
    app.dock.hide();
  }

  tray(contextMenu)
  createMainWindow(isDevMode)
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => activateMainWindow(isDevMode));

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('preferences', (event, arg) => {
  switch (arg) {
    case events.REQUEST_STATUS:
      return status.sendCurrentStatus(event.sender, events.CURRENT_STATUS)
    case events.DND_ACTIVATE:
      return setDndActive()
    case events.DND_DEACTIVATE:
      return setDndDeactive()
    case events.DND_TOGGLE:
      return toggleDnd()
  }
})

function setDndActive() {
  status.dnd = true
}

function setDndDeactive() {
  status.dnd = false
}

function toggleDnd() {
  status.dnd = !status.dnd
}