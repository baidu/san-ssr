import { readStringSync } from '../utils/fs'
import { Emitter } from '../../utils/emitter'
import { resolve } from 'path'

const files = [
    resolve(__dirname, '../utils/underscore.js'),
    resolve(__dirname, '../../models/san-data.js')
]

export function emitRuntime (emitter: Emitter, name: string) {
    emitter.writeLine(`var ${name} = {};`)

    for (const file of files) {
        emitter.writeLine(`!(function (exports) {`)
        emitter.indent()
        emitter.writeLines(readStringSync(file))
        emitter.unindent()
        emitter.writeLine(`})(${name});`)
    }
}
