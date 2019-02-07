import fs from 'fs'
import path from 'path'
import status from './status'

fs.readFile(path.join(__dirname, '../../package.json'), 'utf8', (err, contents) => {
    if (err) return

    const pkg = JSON.parse(contents)
    status.version = pkg.version
})