import { resolve } from 'path'
import { transpileModule, convertCompilerOptionsFromJson, TranspileOptions } from 'typescript'

const tsConfigPath = resolve(__dirname, '../test/cases')
const compilerOptions = convertCompilerOptionsFromJson({}, tsConfigPath).options

export function ts2js (source) {
    const { diagnostics, outputText } =
        transpileModule(source, { compilerOptions })
    if (diagnostics.length) {
        console.log(diagnostics)
        throw new Error('typescript compile error')
    }
    return outputText
}
