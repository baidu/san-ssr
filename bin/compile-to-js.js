#!/usr/bin/env node

const { writeFileSync, readdirSync } = require('fs')
const san = require('../src/js-ssr')
const { resolve, join } = require('path')
const caseRoot = resolve(__dirname, '../test/cases')

for (const dir of readdirSync(caseRoot)) {
    const caseDir = join(caseRoot, dir)
    const ComponentClass = require(join(caseDir, 'component.js'))
    const js = join(caseDir, 'ssr.js')
    const fn = san.compileToSource(ComponentClass)
    const source = `module.exports = ${fn}`
    console.log(`writing ${js} length: ${source.length}`)
    writeFileSync(js, source)
}
