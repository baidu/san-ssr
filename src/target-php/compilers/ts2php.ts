import { compile } from 'ts2php'
import { SourceFile } from 'ts-morph'
import debugFactory from 'debug'

const debug = debugFactory('san-ssr:ts2php')

export interface Modules {
    [key:string]: ModuleInfo
}

type ModuleInfo = {
    name: string,
    required?: boolean,
    namespace?: string
}

export function generatePHPCode (sourceFile: SourceFile, modules: Modules, compilerOptions, nsPrefix: string) {
    debug('compile', sourceFile.getFilePath(), 'options:', modules, 'compilerOptions:', compilerOptions)
    debug('source code:', sourceFile.getFullText())

    const options = {
        source: sourceFile.getFullText(),
        emitHeader: false,
        plugins: [],
        modules,
        helperNamespace: `\\${nsPrefix}runtime\\`,
        compilerOptions
    }
    const { errors, phpCode } = compile(sourceFile.getFilePath(), options)
    if (errors.length) {
        const error = errors[0]
        throw new Error(error.msg || error['messageText'])
    }
    debug('target code:', phpCode)
    return phpCode
}
