#!/usr/bin/env node

require('source-map-support/register')
const { renderOnthefly } = require('../dist/fixtures/case')
const caseName = process.argv[2]

const html = renderOnthefly(caseName)
process.stdout.write(html)
