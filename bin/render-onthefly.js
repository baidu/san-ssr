#!/usr/bin/env node

const { existsSync, readFileSync } = require('fs')
const { resolve, join } = require('path')

const caseName = process.argv[2]
const caseRoot = resolve(__dirname, '../test/cases')
const caseDir = resolve(caseRoot, caseName)

const render = getRender()
const data = getData()
const noDataOutput = /-ndo$/.test(caseName)

const html = render(data, noDataOutput)
process.stdout.write(html)

function getData () {
    const dataJSPath = join(caseDir, 'data.js')
    if (existsSync(dataJSPath)) {
        return require(dataJSPath)
    }
    const dataPath = join(caseDir, 'data.json')
    return JSON.parse(readFileSync(dataPath, 'utf8'))
}

function getRender () {
    const ComponentClass = require(join(caseDir, 'component.js'))
    return require('../dist/index.js').compileToRenderer(ComponentClass, {
        noTemplateOutput: caseDir.indexOf('notpl') > -1
    })
}
