#!/usr/bin/env node

require('source-map-support/register')
const { renderBySource } = require('../dist/fixtures/case')

const caseName = process.argv[2]
const html = renderBySource(caseName)

process.stdout.write(html)
