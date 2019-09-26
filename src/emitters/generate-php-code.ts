import { compile } from 'ts2php'
import { SanSourceFile } from '../parser/san-sourcefile'

export function generatePHPCode (sourceFile: SanSourceFile, removeExternals, compilerOptions) {
    const modules = {}
    for (const name of removeExternals) {
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
