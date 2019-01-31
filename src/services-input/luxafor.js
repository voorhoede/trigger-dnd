import { app } from 'electron'
import Luxafor from 'node-luxafor'
import status from '../main/status'

let luxaLight;

async function getLight() {
    if (!luxaLight) {
        luxaLight = new Luxafor()
    }
    return luxaLight
}

function clearLight() {
    luxaLight = null;
}

export default async function luxafor() {
    const off = [0, 0, 0, 25]
    const red = [255, 0, 0, 25]
    const green = [0, 255, 0, 25]
    const blue = [0, 0, 255, 25]

    getLight()
        .then(light => light.fade(...green).exec())
        .catch(clearLight)

    status.on('statusStarts', () => {
        getLight()
            .then(light => {
                status.dnd 
                    ? light.fade(...red).exec()
                    : light.fade(...blue).exec()
            })
            .catch(clearLight)
    })

    status.on('statusEnds', () => {
        getLight()
            .then(light => light.fade(...green).exec())
            .catch(clearLight)
    })

    app.on('before-quit', () => {
        getLight()
            .then(light => light.fade(...off).exec())
            .catch(clearLight)
    })
}