import { readPHPSource } from '../utils/fs'
import { resolve } from 'path'

const runtimeFiles = [
    'underscore.php',
    'san.php',
    'component-registry.php'
]

export function emitRuntimeInPHP () {
    let code = 'namespace san\\runtime {\n'

    for (const file of runtimeFiles) {
        const path = resolve(__dirname, `../../runtime/${file}`)
        code += readPHPSource(path) + '\n'
    }
    code += `}\n`

    code += 'namespace {\n'
    const path = resolve(__dirname, `../../runtime/Ts2Php_Helper.php`)
    code += readPHPSource(path) + '\n'
    code += '}\n'

    return code
}
