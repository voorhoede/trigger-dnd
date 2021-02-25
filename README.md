# Trigger DnD

**🚨🚨This app is currently in beta! It is under heavy development. Use at your own risk!🚨🚨**

With a push of a button silence notifications in MacOS, set Slack to Do Not Disturb and turn on a Luxafor light!

* 📦 [Latest release](https://github.com/voorhoede-labs/trigger-dnd/releases)

## Installation

Download the zip from [latest release](https://github.com/voorhoede-labs/trigger-dnd/releases). Extract it and place it under your `/Applications` folder.

## Setup

Click the tray icon choose `Preferences`:

### Defaults

* **Duration**: Default minutes of a Do Not Disturb session
* **Status message**: What message should be posted to Slack when you are in Do Not Disturb mode

### Slack

* **Enabled**: Toggle posting to Slack on and off
* **Token**: Your Slack Web API token, get one [here](https://api.slack.com/custom-integrations/legacy-tokens) (about in the middle of the page). Choose your Slack workspace and press on `Create token`. It should look like this: `xoxp-12345678...`
* **Busy icon**: Which icon should Slack use as your status icon, defaults to: `:female-technologist:`

### Mac OS

* **Enabled**: Toggle Do not Disturb on your Mac

### Google Calendar

* **Enabled**: Toggle Google Calendar integration (read more about that [here](#google-calendar-integration))

## Usage

To start the Do not Disturb modus there are a few ways of doing it:

* Right click on the tray icon (🔕) 
* Use the keyboard shortcut `CTRL + AlT + CMD + D`
* Press the big icon when in the app

### Google Calendar integration

**⚠️ With Google Calendar enabled all your calendar items are posted as a Slack status!**

You can connect your Google Calendar to Trigger DnD. In the settings panel, switch the `Enabled` option on and sign in to Google.
Now every time Trigger DnD is running your calendar items will be posted as Slack status messages.

If you add `[dnd]` to your calendar item title, Trigger DnD will automaticaly turn off your notifications during the event!
