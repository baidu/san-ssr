import { readStringSync } from '../utils/fs'
import { Emitter } from '../../utils/emitter'
import { resolve } from 'path'

export function emitRuntime (emitter: Emitter) {
    emitter.writeLine('var sanssrRuntime = {};')

    const underscore = resolve(__dirname, '../utils/underscore.js')
    emitter.writeLine(`!(function (exports){`)
    emitter.indent()
    emitter.writeLines(readStringSync(underscore))
    emitter.unindent()
    emitter.writeLine('})(sanssrRuntime);')

    const sandata = resolve(__dirname, '../../models/san-data.js')
    emitter.writeLine(`!(function (exports){`)
    emitter.indent()
    emitter.writeLines(readStringSync(sandata))
    emitter.unindent()
    emitter.writeLine('})(sanssrRuntime);')
}
