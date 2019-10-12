#!/usr/bin/env node

const { readFileSync } = require('fs')

const data = JSON.parse(readFileSync('data.json', 'utf8'))
const noDataOutput = false
const html = require('./ssr.js')(data, noDataOutput)

process.stdout.write(html)
