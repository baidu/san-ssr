require('ts-node').register()
const { readFileSync, writeFileSync, existsSync } = require('fs')
const compileToJSSource = require('../src/js-ssr').compileToSource
const compileToPHPSource = require('../src/php-ssr').compileToSource
const camelCase = require('camelcase')
const { resolve, join } = require('path')
const caseRoot = resolve(__dirname, '../test/cases')
const { ts2php } = require('../src/transpilers/ts2php')
const san = {
    path: 'dirname(__FILE__) . "/../../../src/runtime/san.php"',
    namespace: '\\san\\runtime\\'
}

function compile (caseName) {
    const caseDir = join(caseRoot, caseName)
    const namespace = getNamespace(caseName)

    const fn = compileToJSSource(requireComponent(caseDir))
    writeFileSync(join(caseDir, 'ssr.js'), `module.exports = ${fn}`)

    const php = compileToPHPSource(requireComponent(caseDir))
    writeFileSync(join(caseDir, 'ssr.php'), `<?php $render = ${php}; ?>`)
}

function getNamespace (caseName) {
    return 'san\\component\\' + camelCase(caseName)
}

function requireComponent (caseDir) {
    const ts = join(caseDir, 'component.ts')
    const js = join(caseDir, 'component.js')

    if (existsSync(ts)) {
        delete require.cache[require.resolve(ts)]
        return require(ts).default
    }
    delete require.cache[require.resolve(js)]
    return require(js)
}

module.exports = { compile }
