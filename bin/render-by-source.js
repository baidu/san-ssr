#!/usr/bin/env node

require('source-map-support/register')
const { join } = require('path')
const { getRenderArguments, ls } = require('../dist/fixtures/case')
const fs = require('fs')

const caseName = process.argv[2]
const caseItem = ls().find(item => item.caseName === caseName)
const caseRoot = caseItem.caseRoot

const ssrSpecPath = join(caseRoot, `${caseName}/ssr-spec.js`)
if (fs.existsSync(ssrSpecPath)) {
    require(ssrSpecPath)
}

const render = require(join(caseRoot, `${caseName}/output/ssr.js`))
const html = render(...getRenderArguments(caseName, caseRoot))

process.stdout.write(html)
