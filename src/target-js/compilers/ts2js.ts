import { transpileModule } from 'typescript'
import { SourceFile } from 'ts-morph'
import debugFactory from 'debug'

const debug = debugFactory('san-ssr:ts2js')

export function tsSourceFile2js (sourceFile: SourceFile, compilerOptions) {
    debug('compile', sourceFile.getFilePath(), 'with options:', compilerOptions)
    return tsCode2js(sourceFile.getFullText(), compilerOptions)
}

export function tsCode2js (sourceCode: string, compilerOptions) {
    debug('source code:', sourceCode)

    const { diagnostics, outputText } =
        transpileModule(sourceCode, { compilerOptions })
    if (diagnostics.length) {
        console.log(diagnostics)
        throw new Error('typescript compile error')
    }
    debug('target code:', outputText)
    return outputText
}
