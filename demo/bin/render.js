#!/usr/bin/env node

const { resolve } = require('path')
const { readFileSync } = require('fs')
const render = require('../dist/index.js')

const data = JSON.parse(readFileSync(resolve(__dirname, '../data.json'), 'utf8'))
const noDataOutput = false
const html = render(data, noDataOutput)

process.stdout.write(html)
