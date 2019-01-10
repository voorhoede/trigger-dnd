import { BrowserWindow } from 'electron'
import * as events from '../events'

export default {
	_intervalId: null,
	_listeners: {
		dnd: [],
		msg: [],
		slackToken: [],
		duration: [],
		endTime: [],
		remainingTime: [],
		dndStarts: [],
		dndEnds: [],
		statusStarts: [],
		statusEnds: [],
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
		return function ({ dnd, duration, msg } = {}) {
			const _duration = duration || this.duration
			this.dnd = dnd || this._dnd
			this.msg = msg || this._msg
			this.endTime = Date.now() + (_duration * 1000 * 60)
			this.remainingTime = this.endTime - Date.now()

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
			this._listeners.statusEnds.forEach(fn => fn())
		}
	}
}