import { compile } from 'ts2php'
import { keyBy } from 'lodash'
import { SanSourceFile } from '../parsers/san-sourcefile'
import debugFactory from 'debug'

const debug = debugFactory('generate-php-code')

export type ModuleInfo = {
    name: string,
    required?: boolean,
    namespace?: string
}

export function generatePHPCode (sourceFile: SanSourceFile, modules: ModuleInfo[], compilerOptions, nsPrefix: string) {
    debug('modules:', modules)
    const options = {
        source: sourceFile.getFullText(),
        emitHeader: false,
        plugins: [],
        modules: keyBy(modules, 'name'),
        helperNamespace: `\\${nsPrefix}runtime\\`,
        compilerOptions
    }
    const { errors, phpCode } = compile(sourceFile.getFilePath(), options)
    if (errors.length) {
        const error = errors[0]
        throw new Error(error.msg || error['messageText'])
    }
    return phpCode
}
