import { compile } from 'ts2php'
import { SanSourceFile } from '../parsers/san-sourcefile'
import debugFactory from 'debug'

const debug = debugFactory('generate-php-code')

export function generatePHPCode (sourceFile: SanSourceFile, skipRequire, compilerOptions) {
    debug('skipRequire:', skipRequire)
    const modules = {}
    for (const name of skipRequire) {
        modules[name] = { name, required: true }
    }
    const { errors, phpCode } = compile(sourceFile.getFilePath(), {
        source: sourceFile.getFullText(),
        emitHeader: false,
        plugins: [],
        modules,
        helperClass: '\\san\\runtime\\Ts2Php_Helper',
        compilerOptions
    })
    if (errors.length) {
        const error = errors[0]
        throw new Error(error.msg || error['messageText'])
    }
    return phpCode
}
