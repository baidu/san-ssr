const { compile } = require('ts2php')
const tsconfig = require('../../test/tsconfig.json')

function ts2php (file, san, namespace) {
    const { errors, phpCode } = compile(file, {
        emitHeader: true,
        namespace,
        modules: { san },
        compilerOptions: tsconfig.compilerOptions
    })
    if (errors.length) {
        const error = errors[0]
        throw new Error(error.msg || error.messageText)
    }
    return phpCode
}

exports.ts2php = ts2php
