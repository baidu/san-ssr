import { readStringSync } from '../utils/fs'
import { Emitter } from '../../utils/emitter'
import { resolve } from 'path'

export function emitRuntime (emitter: Emitter) {
    const path = resolve(__dirname, '../../../runtime/underscore.js')
    const sandata = resolve(__dirname, '../../../runtime/sandata.js')
    emitter.writeLines(readStringSync(path))
    emitter.writeLines(readStringSync(sandata))
}
