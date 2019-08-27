#!/usr/bin/env node

const { readFileSync } = require('fs')
const { resolve, join } = require('path')
const caseRoot = resolve(__dirname, '../test/cases')
const { read } = require('../src/data')

const caseName = process.argv[2]
console.log(caseName)

const caseDir = join(caseRoot, caseName)
const dataPath = join(caseDir, 'data.json')
const htmlPath = join(caseDir, 'result.html')
const ssrPath = join(caseDir, 'ssr.js')

const expected = readFileSync(htmlPath, 'utf8')
console.log('-----------expected--------------')
console.log(expected)
console.log()

const data = read(dataPath)
const noDataOutput = /-ndo$/.test(caseDir)
const jsRendered = require(ssrPath)(data, noDataOutput)
console.log('------------js-ssr---------------', result(jsRendered))
console.log(jsRendered)
console.log()

function result (html) {
    return html === expected ? 'PASS' : 'FAIL'
}
