#!/usr/bin/env node

require('source-map-support/register')
const { renderOnthefly, ls } = require('../dist/fixtures/case')
const caseName = process.argv[2]
const caseItem = ls().find(item => item.caseName === caseName)
const caseRoot = caseItem.caseRoot

const html = renderOnthefly(caseName, caseRoot)
process.stdout.write(html)
