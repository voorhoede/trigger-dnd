import path from 'path'
import { app, BrowserWindow, Tray, Menu, session, ipcMain } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import createMainWindow, { activate as activateMainWindow } from './main/main-window'
import tray from './main/tray'
import { activate } from './main/main-window';
import * as events from './events'
import status from './main/status'
import triggerSlack from './services/slack'

const isDevMode = process.execPath.match(/[\\/]electron/);
const contextMenu = Menu.buildFromTemplate([
  {
    label: 'Set DnD',
    id: 'dnd-status',
    type: 'checkbox',
    click () { toggleDnd() }
	},
  { type: 'separator' },
	{
    label: 'Preferences',
    accelerator: 'Command+,',
	},
	{ type: 'separator' },
	{ label: 'Quit TriggerDnD',
		accelerator: 'Command+Q',
		selector: 'terminate:',
	}
])

status.on('dnd', function(dnd) {
  contextMenu.getMenuItemById('dnd-status').checked = dnd
})

status.on('remainingTime', function(remainingTime) {
  console.log('remaining time:', remainingTime)
})

status.on('statusEnds', function () {
  console.log('status ended!')
})

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

ipcMain.on('preferences', (event, eventName, ...args) => {
  switch (eventName) {
    case events.REQUEST_STATUS:
      return status.sendCurrentStatus(event.sender, events.CURRENT_STATUS)
    case events.DND_ACTIVATE:
      return setDndActive()
    case events.DND_DEACTIVATE:
      return setDndDeactive()
    case events.DND_TOGGLE:
      return toggleDnd()
    case events.MSG_CHANGE:
      return setMsg(...args)
    case events.DURATION_CHANGE:
      return setDuration(...args)
    case events.SLACK_TOKEN_CHANGE:
      return setSlackToken(...args)
  }
})

function setDndActive() {
  status.startStatus({ dnd: true })
}

function setDndDeactive() {
  status.cancelStatus()
}

function toggleDnd() {
  status.dnd = !status.dnd
}

function setMsg(msg) {
  status.msg = msg
}

function setDuration(duration) {
  status.duration = duration
}

function setSlackToken(token) {
  status.slackToken = token
}

// triggerSlack()