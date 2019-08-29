#!/usr/bin/env node

const { resolve, join } = require('path')
const { read } = require('../src/data')

const caseName = process.argv[2]
const caseRoot = resolve(__dirname, '../test/cases')
const caseDir = resolve(caseRoot, caseName)
const jsSSRPath = join(caseDir, 'ssr.js')
const dataPath = join(caseDir, 'data.json')

const data = read(dataPath)
const noDataOutput = /-ndo$/.test(caseDir)
const jsRendered = require(jsSSRPath)(data, noDataOutput)
process.stdout.write(jsRendered)
