import { app } from 'electron'
import Luxafor from 'node-luxafor'
import status from '../main/status'

export default function luxafor() {
    try {
        const light = new Luxafor()
        const off = [0, 0, 0, 25]
        const red = [255, 0, 0, 25]
        const green = [0, 255, 0, 25]
        const blue = [0, 0, 255, 25]
        light.fade(...green).exec()

        status.on('statusStarts', () => {
            status.dnd 
                ? light.fade(...red).exec()
                : light.fade(...blue).exec()
        })

        status.on('statusEnds', () => {
            light.fade(...green).exec()
        })

        app.on('before-quit', () => {
            light.fade(...off).exec()
        })
    } catch (err) {
        console.log(err.message)
    }
}