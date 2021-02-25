import fs from 'fs'
import util from 'util'
import path from 'path'
import { app } from 'electron'
import status from './status'

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const preferencesFile = path.join(app.getPath('userData'), 'preferences.json')

async function createPreferencesFile() {
  const fileContents = JSON.stringify({
    duration: status.duration,
    userMsg: status.userMsg,
    slackToken: status.slackToken,
    slackEnabled: status.slackEnabled,
    osEnabled: status.osEnabled,
  })

  await writeFile(preferencesFile, fileContents).catch(console.log)

  return fileContents
}

function updateSetting(key) {
  return async function (value) {
    const contents = await readFile(preferencesFile, 'utf8')
      .then(JSON.parse)
      .catch(console.error)

    contents[key] = value

    return writeFile(preferencesFile, JSON.stringify(contents))
  }
}

export async function loadPersistentData() {
  const contents = await readFile(preferencesFile, 'utf8')
    .then(JSON.parse)
    .catch(createPreferencesFile)

  Object.entries(contents).forEach(([key, value]) => {
    status[key] = value
  })
}

status.on('autoStart', updateSetting('autoStart'))
status.on('duration', updateSetting('duration'))
status.on('userMsg', updateSetting('userMsg'))
status.on('slackToken', updateSetting('slackToken'))
status.on('slackEnabled', updateSetting('slackEnabled'))
status.on('slackBusyIcon', updateSetting('slackBusyIcon'))
status.on('osEnabled', updateSetting('osEnabled'))
status.on('googleCalendarEnabled', updateSetting('googleCalendarEnabled'))
status.on('googleCalendarDndOnly', updateSetting('googleCalendarDndOnly'))
