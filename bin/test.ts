#!/usr/bin/env ts-node

import * as chalk from 'chalk'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { renderByJS, renderByPHP, compilePHP, compileJS } from '../test/case'

const caseName = process.argv[2]
const htmlPath = resolve(__dirname, '../test/cases', caseName, 'result.html')
const expected = readFileSync(htmlPath, 'utf8')

compileJS(caseName)
compilePHP(caseName)

console.log(chalk['green']('[EXPECTED]'))
console.log(expected)
console.log()

check(`[SSR:  JS] ${caseName}`, renderByJS(caseName))
check(`[SSR: PHP] ${caseName}`, renderByPHP(caseName))

function check (title, html) {
    const color = html === expected ? 'green' : 'red'
    console.log(chalk[color](title))
    console.log(html)
    console.log()
    if (html !== expected) process.exit(1)
}
