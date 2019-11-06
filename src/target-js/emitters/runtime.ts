import { readStringSync } from '../utils/fs'
import { Emitter } from '../..'
import { resolve } from 'path'

export function emitRuntime (emitter: Emitter) {
    const path = resolve(__dirname, '../../../runtime/underscore.js')
    emitter.writeLines(readStringSync(path))
}