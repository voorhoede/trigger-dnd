import { BrowserWindow } from 'electron'
import * as events from '../events'

export default {
	_menuItem: null,
	set menuItem(value) {
		this._menuItem = value
	},

	_dnd: false,
	get dnd() {
		return this._dnd
	},
	set dnd(value) {
		this._dnd = value
		BrowserWindow.getAllWindows().forEach(this.sendCurrentStatus.bind(this))
		this.setMenuItemValue()
	},

	get sendCurrentStatus() {
		return function (target, channel) {
			const cleanStatus = Object.keys(this)
				.filter(key => !key.includes('_'))
				.reduce((obj, key) => Object.assign(obj, { [key]: this[key] }), {})
			target.send(events.CURRENT_STATUS, cleanStatus)
		}
	},

	get setMenuItemValue() {
		return function () {
			if (this._menuItem) {
				this._menuItem.checked = this._dnd
			}
		}
	}
}