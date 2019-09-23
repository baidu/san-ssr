import { readPHPSource } from '../utils/fs'
import { PHPEmitter } from './php-emitter'
import { resolve } from 'path'

const runtimeFiles = [
    'underscore.php',
    'san.php',
    'component-registry.php'
]

export function emitRuntimeInPHP (emitter = new PHPEmitter()) {
    emitter.beginNamespace('san\\runtime')
    for (const file of runtimeFiles) {
        const path = resolve(__dirname, `../../runtime/${file}`)
        emitter.writeLines(readPHPSource(path))
    }
    emitter.endNamespace()

    // TODO move Ts2Php_Helper into \san\runtime namespace
    // see: https://github.com/max-team/ts2php/issues/49
    emitter.beginNamespace()
    const path = resolve(__dirname, `../../runtime/Ts2Php_Helper.php`)
    emitter.writeLines(readPHPSource(path))
    emitter.endNamespace()

    return emitter.fullText()
}
