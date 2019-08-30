const { compile } = require('ts2php')
const { unlinkSync, writeFileSync } = require('fs')
const { tmpdir } = require('os')
const { resolve } = require('path')

const options = {
    emitHeader: false,
    compilerOptions: {
        noImplicitAny: false
    }
}

exports.fn2php = function (fn) {
    const src = 'const fn = ' + fn.toString()
    const srcfile = resolve(tmpdir(), Math.random() + '.san-ssr.ts')
    writeFileSync(srcfile, src)
    const { errors, phpCode } = compile(srcfile, options)
    unlinkSync(srcfile)
    if (errors.length) {
        const error = errors[0]
        throw new Error(error.msg || error.messageText)
    }
    return phpCode.replace(/^\$fn\s*=\s*/, '').replace(/;\s*$/, '')
}
