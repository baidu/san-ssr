#!/usr/bin/env node

const { writeFileSync, readdirSync } = require('fs')
const san = require('../src/js-ssr')
const { resolve, join } = require('path')
const caseRoot = resolve(__dirname, '../test/cases')
const { read } = require('../test/data')

for (const dir of readdirSync(caseRoot)) {
    const caseDir = join(caseRoot, dir)
    const Component = require(join(caseDir, 'component.js'))
    const ComponentData = read(join(caseDir, 'data.json'))
    const noDataOutput = /-ndo$/.test(caseDir)

    const html = san.compileToRenderer(Component)(ComponentData, noDataOutput)
    const htmlPath = join(caseDir, 'result.html')

    console.log(`writing ${htmlPath} length: ${html.length}`)
    writeFileSync(htmlPath, html)
}
