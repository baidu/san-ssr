#!/usr/bin/env node

const { existsSync, readFileSync } = require('fs')
const { resolve, join } = require('path')

const caseName = process.argv[2]
const caseRoot = resolve(__dirname, '../test/cases')
const caseDir = resolve(caseRoot, caseName)
const jsSSRPath = join(caseDir, 'ssr.js')

const data = getData(caseDir)
const noDataOutput = /-ndo$/.test(caseDir)
const jsRendered = require(jsSSRPath)(data, noDataOutput)
process.stdout.write(jsRendered)

function getData (caseDir) {
    const dataJSPath = join(caseDir, 'data.js')
    if (existsSync(dataJSPath)) {
        return require(dataJSPath)
    }
    const dataPath = join(caseDir, 'data.json')
    return JSON.parse(readFileSync(dataPath, 'utf8'))
}
