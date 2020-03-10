#!/usr/bin/env node

require('source-map-support/register')
const { getRenderArguments } = require('../dist/fixtures/case')

const caseName = process.argv[2]
const render = require(`../test/cases/${caseName}/ssr.js`)
const html = render(...getRenderArguments(caseName))

process.stdout.write(html)
