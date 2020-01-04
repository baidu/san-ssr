import { readStringSync } from '../utils/fs'
import { Emitter } from '../../utils/emitter'
import { resolve } from 'path'

export function emitRuntime (emitter: Emitter) {
    emitter.writeLine('var sanssrRuntime = {};')

    const underscore = resolve(__dirname, '../utils/underscore.js')
    emitter.writeLines(`!(function (exports){${readStringSync(underscore)}})(sanssrRuntime);`)

    const sandata = resolve(__dirname, '../../models/san-data.js')
    emitter.writeLines(`!(function (exports){${readStringSync(sandata)}})(sanssrRuntime);`)

    emitter.writeLine('var _ = sanssrRuntime._;')
}
