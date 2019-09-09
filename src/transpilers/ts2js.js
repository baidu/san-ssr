const { resolve } = require('path')
const ts = require('typescript')
const tsConfigPath = resolve(__dirname, '../test/cases')
const compilerOptions = ts.convertCompilerOptionsFromJson({}, tsConfigPath)

function ts2js (source) {
    const { diagnostics, outputText } =
        ts.transpileModule(source, { compilerOptions })
    if (diagnostics.length) {
        console.log(diagnostics)
        throw new Error('typescript compile error')
    }
    return outputText
}

exports.ts2js = ts2js
