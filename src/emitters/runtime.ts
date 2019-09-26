import { readPHPSource, readStringSync } from '../utils/fs'
import { Emitter } from './emitter'
import { PHPEmitter } from './php-emitter'
import { resolve } from 'path'

const runtimeFiles = [
    'underscore.php',
    'san.php',
    'Ts2Php_Helper.php',
    'component-registry.php'
]

export function emitRuntimeInPHP (emitter: PHPEmitter) {
    emitter.beginNamespace('san\\runtime')
    for (const file of runtimeFiles) {
        const path = resolve(__dirname, `../../runtime/${file}`)
        emitter.writeLines(readPHPSource(path))
    }
    emitter.endNamespace()
    return emitter.fullText()
}

export function emitRuntimeInJS (emitter: Emitter) {
    const path = resolve(__dirname, '../../runtime/underscore.js')
    emitter.writeLines(readStringSync(path))
}
