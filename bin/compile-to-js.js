#!/usr/bin/env node

const { compileAllToJS, compileToJS } = require('../dist/bin/case')

const caseName = process.argv[2]

if (caseName === '--all') compileAllToJS()
else compileToJS(caseName)
