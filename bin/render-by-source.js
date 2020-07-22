#!/usr/bin/env node

require('source-map-support/register')
const { join } = require('path')
const { caseRoot, getRenderArguments } = require('../dist/fixtures/case')

const caseName = process.argv[2]
const render = require(join(caseRoot, `${caseName}/ssr.js`))
const html = render(...getRenderArguments(caseName))

process.stdout.write(html)
