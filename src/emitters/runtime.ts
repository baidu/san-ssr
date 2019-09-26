import { readPHPSource } from '../utils/fs'
import { PHPEmitter } from './php-emitter'
import { resolve } from 'path'

const runtimeFiles = [
    'underscore.php',
    'san.php',
    'Ts2Php_Helper.php',
    'component-registry.php'
]

export function emitRuntimeInPHP (emitter = new PHPEmitter()) {
    emitter.beginNamespace('san\\runtime')
    for (const file of runtimeFiles) {
        const path = resolve(__dirname, `../../runtime/${file}`)
        emitter.writeLines(readPHPSource(path))
    }
    emitter.endNamespace()
    return emitter.fullText()
}
