import { transpileModule } from 'typescript'
import { SourceFile } from 'ts-morph'

export function ts2js (sourceFile: SourceFile, compilerOptions = {}) {
    const { diagnostics, outputText } =
        transpileModule(sourceFile.getFullText(), { compilerOptions })
    if (diagnostics.length) {
        console.log(diagnostics)
        throw new Error('typescript compile error')
    }
    return outputText
}
