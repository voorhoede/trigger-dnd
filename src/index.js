import path from 'path'
import { app, BrowserWindow, Tray, Menu, session, ipcMain } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import createMainWindow, { activate as activateMainWindow } from './main/main-window'
import tray from './main/tray'
import { activate } from './main/main-window';
import * as events from './events'
import status from './main/status'
import { loadPersistentData } from './main/persistent-data'
import triggerSlack from './services/slack'
import triggerSystemDnd from './services/system-dnd'

const isDevMode = process.execPath.match(/[\\/]electron/);
const contextMenu = Menu.buildFromTemplate([
  {
    label: 'Start DnD',
    id: 'dnd-start',
    click () { setDndActive() }
  },
  {
    label: 'End DnD',
    id: 'dnd-end',
    enabled: false,
    click () { setDndDeactive() }
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

status.on('dnd', function (dnd) {
  contextMenu.getMenuItemById('dnd-start').enabled = !dnd
  contextMenu.getMenuItemById('dnd-end').enabled = dnd
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
    case events.STATUS_ACTIVATE:
      return triggerStatus()
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
  status.dnd
    ? status.cancelStatus()
    : status.startStatus({ dnd: true })
}

function triggerStatus() {
  status.startStatus()
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

loadPersistentData()
triggerSlack()
triggerSystemDnd()