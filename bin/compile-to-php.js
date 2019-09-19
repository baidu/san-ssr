#!/usr/bin/env node

const { compileToPHP, compileAllToPHP } = require('../dist/bin/case')

const caseName = process.argv[2]

if (caseName === '--all') compileAllToPHP()
else compileToPHP(caseName)
