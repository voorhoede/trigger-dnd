import { BrowserWindow, systemPreferences } from 'electron'
import * as events from '../events'

const status = {
	_intervalId: null,
	_listeners: {
		autoStart: [],
		cancelable: [],
		version: [],
		dark: [],
		dnd: [],
		msg: [],
		slackToken: [],
		slackEnabled: [],
		slackBusyIcon: [],
		osEnabled: [],
		duration: [],
		endTime: [],
		remainingTime: [],
		dndStarts: [],
		dndEnds: [],
		statusStarts: [],
		statusEnds: [],
		googleCalendarEnabled: [],
		googleToken: [],
		googleCalendarEvents: [],
		googleCalendarDndOnly: [],
		googleCalendarUntilNext: [],
		googleCalendarIsFetching: [],
	},

	_autoStart: false,
	get autoStart() {
		return this._autoStart
	},
	set autoStart(value) {
		const prevValue = this._autoStart
		this._autoStart = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.autoStart.forEach(fn => fn(this._autoStart, prevValue))
	},

	_cancelable: true,
	get cancelable() {
		return this._cancelable
	},
	set cancelable(value) {
		const prevValue = this._cancelable
		this._cancelable = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.cancelable.forEach(fn => fn(this._cancelable, prevValue))
	},

	_version: false,
	get version() {
		return this._version
	},
	set version(value) {
		const prevValue = this._version
		this._version = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.version.forEach(fn => fn(this._version, prevValue))
	},

	_dark: systemPreferences.isDarkMode(),
	get dark() {
		return this._dark
	},
	set dark(value) {
		const prevValue = this._dark
		this._dark = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.dark.forEach(fn => fn(this._dark, prevValue))
	},

	_dnd: false,
	get dnd() {
		return this._dnd
	},
	set dnd(value) {
		const prevValue = this._dnd
		this._dnd = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.dnd.forEach(fn => fn(this._dnd, prevValue))
	},

	_msg: '',
	get msg() {
		return this._msg
	},
	set msg(value) {
		const prevValue = this._msg
		this._msg = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.msg.forEach(fn => fn(this._msg, prevValue))
	},

	_duration: 60,
	get duration() {
		return this._duration
	},
	set duration(value) {
		const prevValue = this._duration
		this._duration = Number(value)
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.duration.forEach(fn => fn(this._duration, prevValue))
	},

	_endTime: null,
	get endTime() {
		return this._endTime
	},
	set endTime(value) {
		const prevValue = this._endTime
		this._endTime = Number(value)
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.endTime.forEach(fn => fn(this._endTime, prevValue))
	},

	_remainingTime: null,
	get remainingTime() {
		return this._remainingTime
	},
	set remainingTime(value) {
		const prevValue = this._remainingTime
		this._remainingTime = Number(value)
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.remainingTime.forEach(fn => fn(this._remainingTime, prevValue))
	},

	_osEnabled: true,
	get osEnabled() {
		return this._osEnabled
	},
	set osEnabled(value) {
		const prevValue = this._osEnabled
		this._osEnabled = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.osEnabled.forEach(fn => fn(this._osEnabled, prevValue))
	},

	_slackEnabled: true,
	get slackEnabled() {
		return this._slackEnabled
	},
	set slackEnabled(value) {
		const prevValue = this._slackEnabled
		this._slackEnabled = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.slackEnabled.forEach(fn => fn(this._slackEnabled, prevValue))
	},

	_slackToken: '',
	get slackToken() {
		return this._slackToken
	},
	set slackToken(value) {
		const prevValue = this._slackToken
		this._slackToken = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.slackToken.forEach(fn => fn(this._slackToken, prevValue))
	},

	_slackBusyIcon: ':female-technologist:',
	get slackBusyIcon() {
		return this._slackBusyIcon
	},
	set slackBusyIcon(value) {
		const prevValue = this._slackBusyIcon
		this._slackBusyIcon = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.slackBusyIcon.forEach(fn => fn(this._slackBusyIcon, prevValue))
	},

	_googleCalendarEnabled: false,
	get googleCalendarEnabled() {
		return this._googleCalendarEnabled
	},
	set googleCalendarEnabled(value) {
		const prevValue = this._googleCalendarEnabled
		this._googleCalendarEnabled = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.googleCalendarEnabled.forEach(fn => fn(this._googleCalendarEnabled, prevValue))
	},

	_googleCalendarIsFetching: false,
	get googleCalendarIsFetching() {
		return this._googleCalendarIsFetching
	},
	set googleCalendarIsFetching(value) {
		const prevValue = this._googleCalendarIsFetching
		this._googleCalendarIsFetching = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.googleCalendarIsFetching.forEach(fn => fn(this._googleCalendarIsFetching, prevValue))
	},

	_googleToken: '',
	get googleToken() {
		return this._googleToken
	},
	set googleToken(value) {
		const prevValue = this._googleToken
		this._googleToken = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.googleToken.forEach(fn => fn(this._googleToken, prevValue))
	},

	_googleCalendarDndOnly: true,
	get googleCalendarDndOnly() {
		return this._googleCalendarDndOnly
	},
	set googleCalendarDndOnly(value) {
		const prevValue = this._googleCalendarDndOnly
		this._googleCalendarDndOnly = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.googleCalendarDndOnly.forEach(fn => fn(this._googleCalendarDndOnly, prevValue))
	},

	_googleCalendarUntilNext: null,
	get googleCalendarUntilNext() {
		return this._googleCalendarUntilNext
	},
	set googleCalendarUntilNext(value) {
		const prevValue = this._googleCalendarUntilNext
		this._googleCalendarUntilNext = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.googleCalendarUntilNext.forEach(fn => fn(this._googleCalendarUntilNext, prevValue))
	},

	get sendCurrentStatus() {
		return function (target, channel) {
			const cleanStatus = Object.keys(this)
				.filter(key => !key.includes('_'))
				.reduce((obj, key) => Object.assign(obj, { [key]: this[key] }), {})
			target.send(events.CURRENT_STATUS, cleanStatus)
		}
	},

	get on() {
		return function (prop, fn) {
			this._listeners[prop].push(fn)
		}
	},

	get startStatus() {
		return function ({ dnd, duration, msg, cancelable = true, emoji = undefined } = {}) {
			const _duration = duration || this.duration
			this.dnd = dnd || this._dnd
			this.msg = msg || this._msg
			this.endTime = Date.now() + (_duration * 1000 * 60)
			this.remainingTime = this.endTime - Date.now()
			this.cancelable = cancelable

			const intervalCallback = () => {
				this.remainingTime = this.endTime - Date.now()
				if (this.remainingTime <= 0) {
					this.cancelStatus()
				}
			}

			this._intervalId = setInterval(intervalCallback, 1000)

			if (this.dnd) {
				this._listeners.dndStarts.forEach(fn => fn())
			}
			this._listeners.statusStarts.forEach(fn => fn({ emoji }))
		}
	},

	get cancelStatus() {
		return function () {
			if (this.dnd) {
				this._listeners.dndEnds.forEach(fn => fn())
			}
			clearInterval(this._intervalId)
			this._intervalId = null
			this.remainingTime = null
			this.dnd = false
			this.endTime = null
			this.cancelable = true
			this._listeners.statusEnds.forEach(fn => fn())
		}
	}
}

export default status

status.googleCalendarEvents = new Proxy([], {
	set(target, prop, value) {
		target[prop] = value
		BrowserWindow.getAllWindows().forEach(status.sendCurrentStatus.bind(status))
		status._listeners.googleCalendarEvents.forEach(fn => fn(status.googleCalendarEvents))
		return true
	}
})