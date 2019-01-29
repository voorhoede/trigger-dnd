import { BrowserWindow, systemPreferences } from 'electron'
import * as events from '../events'

const status = {
	_intervalId: null,
	_listeners: {
		cancelable: [],
		dark: [],
		dnd: [],
		msg: [],
		slackToken: [],
		slackEnabled: [],
		osEnabled: [],
		duration: [],
		endTime: [],
		remainingTime: [],
		dndStarts: [],
		dndEnds: [],
		statusStarts: [],
		statusEnds: [],
		googleCalendarEnabled: [],
		googleClientId: [],
		googleClientSecret: [],
		googleProjectId: [],
		googleCalendarEvents: [],
		googleCalendarUntilNext: [],
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

	_googleClientId: '',
	get googleClientId() {
		return this._googleClientId
	},
	set googleClientId(value) {
		const prevValue = this._googleClientId
		this._googleClientId = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.googleClientId.forEach(fn => fn(this._googleClientId, prevValue))
	},

	_googleClientSecret: '',
	get googleClientSecret() {
		return this._googleClientSecret
	},
	set googleClientSecret(value) {
		const prevValue = this._googleClientSecret
		this._googleClientSecret = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.googleClientSecret.forEach(fn => fn(this._googleClientSecret, prevValue))
	},

	_googleProjectId: '',
	get googleProjectId() {
		return this._googleProjectId
	},
	set googleProjectId(value) {
		const prevValue = this._googleProjectId
		this._googleProjectId = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this._listeners.googleProjectId.forEach(fn => fn(this._googleProjectId, prevValue))
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
		return function ({ dnd, duration, msg, cancelable = true } = {}) {
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
			this._listeners.statusStarts.forEach(fn => fn())
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