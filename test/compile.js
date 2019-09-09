const { readFileSync, writeFileSync, existsSync } = require('fs')
const compileToJSSource = require('../src/js-ssr').compileToSource
const compileToPHPSource = require('../src/php-ssr').compileToSource
const camelCase = require('camelcase')
const { resolve, join } = require('path')
const caseRoot = resolve(__dirname, '../test/cases')
const { ts2php } = require('../src/transpilers/ts2php')
const { requireFromString } = require('../src/loaders/require-from-string')
const san = {
    path: 'dirname(__FILE__) . "/../../../src/runtime/san.php"',
    namespace: '\\san\\runtime\\'
}

function compile (caseName) {
    const caseDir = join(caseRoot, caseName)
    const compPath = join(caseDir, 'component.ts')
    const compJSPath = join(caseDir, 'component.js')
    const component = readFileSync(compJSPath, 'utf8')
    const namespace = getNamespace(caseName)

    if (existsSync(compPath)) {
        const compPHPPath = join(caseDir, 'component.php')
        const php = ts2php(compPath, san, namespace)
        writeFileSync(compPHPPath, php)
    }

    const fn = compileToJSSource(requireFromString(component))
    writeFileSync(join(caseDir, 'ssr.js'), `module.exports = ${fn}`)

    const php = compileToPHPSource(requireFromString(component))
    writeFileSync(join(caseDir, 'ssr.php'), `<?php $render = ${php}; ?>`)
}

function getNamespace (caseName) {
    return 'san\\component\\' + camelCase(caseName)
}

module.exports = { compile }
