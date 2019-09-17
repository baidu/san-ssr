#!/usr/bin/env node

const { readFileSync } = require('fs')
const { resolve, join } = require('path')

const caseName = process.argv[2]
const caseRoot = resolve(__dirname, '../test/cases')
const caseDir = resolve(caseRoot, caseName)
const jsSSRPath = join(caseDir, 'ssr.js')
const dataPath = join(caseDir, 'data.json')

const data = JSON.parse(readFileSync(dataPath, 'utf8'))
const noDataOutput = /-ndo$/.test(caseDir)
const jsRendered = require(jsSSRPath)(data, noDataOutput)
process.stdout.write(jsRendered)
