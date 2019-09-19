import { ComponentParser } from '../parser/component-parser'
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { compileToSource as compileToJSSource } from '../js-ssr'
import { compileToSource as compileToPHPSource } from '../php-ssr'
import { Compiler as ToPHPCompiler } from '../transpilers/ts2php'
import { Compiler as ToJSCompiler } from '../transpilers/ts2js'
import camelCase from 'camelcase'
import ProgressBar = require('progress')

const caseRoot = resolve(__dirname, '../../test/cases')
const tsconfigPath = resolve(__dirname, '../../test/tsconfig.json')
const cases = readdirSync(caseRoot)
const ccj = new ToJSCompiler(tsconfigPath)
const ccp = new ToPHPCompiler({
    tsconfigPath,
    nsPrefix: 'san\\components\\test\\'
})
const parser = new ComponentParser(tsconfigPath)

export function compileToJS (caseName) {
    const caseDir = join(caseRoot, caseName)
    const ts = join(caseDir, 'component.ts')
    let componentClass

    if (existsSync(ts)) {
        const component = parser.parseComponent(ts)
        componentClass = ccj.compileAndRun(component.getComponentSourceFile())['default']
    } else {
        const js = resolve(caseDir, 'component.js')
        componentClass = require(js)
    }

    const fn = compileToJSSource(componentClass)
    writeFileSync(join(caseDir, 'ssr.js'), `module.exports = ${fn}`)
}

export function compileToPHP (caseName) {
    const caseDir = join(caseRoot, caseName)
    const ts = join(caseDir, 'component.ts')
    let componentClass
    let code = ''

    if (existsSync(ts)) {
        const component = parser.parseComponent(ts)
        componentClass = ccj.compileAndRun(component.getComponentSourceFile())['default']
        code += ccp.compileComponent(component)
    } else {
        const js = resolve(caseDir, 'component.js')
        componentClass = ccj.run(readFileSync(js, 'utf8'))
    }

    const renderCode = compileToPHPSource(
        componentClass,
        { funcName: 'render' }
    )

    code +=
        `namespace san\\renderer\\${camelCase(caseName)} {\n` +
        `    ${renderCode}` +
        `}\n`
    writeFileSync(join(caseDir, 'ssr.php'), `<?php ${code} ?>`)
}

export function compileAllToJS () {
    const p = new ProgressBar(
        ':current/:total (:elapseds) compiling :caseName',
        { total: cases.length }
    )
    for (const caseName of cases) {
        p.tick(0, { caseName })
        compileToJS(caseName)
        p.tick()
    }
}

export function compileAllToPHP () {
    const p = new ProgressBar(
        ':current/:total (:elapseds) compiling :caseName',
        { total: cases.length }
    )
    for (const caseName of cases) {
        p.tick(0, { caseName })
        compileToPHP(caseName)
        p.tick()
    }
}
