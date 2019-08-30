const { writeFileSync } = require('fs')
const compileToJSSource = require('../src/js-ssr').compileToSource
const compileToPHPSource = require('../src/php-ssr').compileToSource
const { resolve, join } = require('path')
const caseRoot = resolve(__dirname, '../test/cases')

exports.js = function (caseName) {
    const caseDir = join(caseRoot, caseName)
    const jsSSRPath = join(caseDir, 'ssr.js')
    const compPath = join(caseDir, 'component.js')

    delete require.cache[require.resolve(compPath)]
    const ComponentClass = require(compPath)
    const fn = compileToJSSource(ComponentClass)
    writeFileSync(jsSSRPath, `module.exports = ${fn}`)
}

exports.php = function (caseName) {
    const caseDir = join(caseRoot, caseName)
    const phpSSRPath = join(caseDir, 'ssr.php')
    const compPath = join(caseDir, 'component.js')

    delete require.cache[require.resolve(compPath)]
    const ComponentClassForPHP = require(compPath)
    const php = compileToPHPSource(ComponentClassForPHP)
    writeFileSync(phpSSRPath, `<?php $render = ${php}; ?>`)
}
