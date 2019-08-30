#!/usr/bin/env node

const compile = require('../src/compile')
const chalk = require('chalk')
const { readFileSync } = require('fs')
const { resolve } = require('path')
const { render } = require('../src/render')

const caseName = process.argv[2]
const htmlPath = resolve(__dirname, '../test/cases', caseName, 'result.html')
const expected = readFileSync(htmlPath, 'utf8')

compile.js(caseName)
compile.php(caseName)

console.log(chalk.green('[EXPECTED]'))
console.log(expected)
console.log()

check(`[SSR:  JS] ${caseName}`, render(caseName, 'js'))
check(`[SSR: PHP] ${caseName}`, render(caseName, 'php'))

function check (title, html) {
    const color = html === expected ? 'green' : 'red'
    console.log(chalk[color](title))
    console.log(html)
    console.log()
    if (html !== expected) process.exit(1)
}
