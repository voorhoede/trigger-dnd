import { BrowserWindow } from 'electron'
import * as events from '../events'

export default {
	_listeners: {
		dnd: []
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
}