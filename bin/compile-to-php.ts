#!/usr/bin/env ts-node

import { compileToSource } from '../src/php-ssr'
import { resolve, join } from 'path'
import { writeFileSync, readdirSync, existsSync } from 'fs'

const caseRoot = resolve(__dirname, '../test/cases')
const caseName = process.argv[2]
const caseNames = caseName === '--all' ? readdirSync(caseRoot) : [caseName]

for (const caseName of caseNames) {
    const caseDir = join(caseRoot, caseName)
    const ts = join(caseDir, 'component.ts')
    const js = join(caseDir, 'component.js')
    const componentClass = existsSync(ts) ? require(ts).default : require(js)
    const fn = compileToSource(componentClass)
    writeFileSync(join(caseDir, 'ssr.php'), `<?php $render = ${fn}; ?>`)
}
