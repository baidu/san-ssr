import { exec } from './exec'
import { ComponentParser } from '../transpilers/component-parser'
import { readdirSync, writeFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { compileToSource as compileToJSSource } from '../js-ssr'
import { compileToSource as compileToPHPSource } from '../php-ssr'
import { Compiler as ToPHPCompiler } from '../transpilers/ts2php'
import { Compiler as ToJSCompiler } from '../transpilers/ts2js'
import camelCase from 'camelcase'

const caseRoot = resolve(__dirname, '../../test/cases')
const tsconfigPath = resolve(__dirname, '../../test/tsconfig.json')
const cases = readdirSync(caseRoot)

export function compileToJS (caseName) {
    const caseDir = join(caseRoot, caseName)
    const ts = join(caseDir, 'component.ts')
    const js = join(caseDir, 'component.js')
    const componentClass = existsSync(ts) ? require(ts).default : require(js)
    const fn = compileToJSSource(componentClass)
    writeFileSync(join(caseDir, 'ssr.js'), `module.exports = ${fn}`)
}

export function compileAllToJS () {
    for (const caseName of cases) compileToJS(caseName)
}

export function compileToPHP (caseName) {
    const caseDir = join(caseRoot, caseName)
    const ts = join(caseDir, 'component.ts')
    let componentClass
    let code = ''

    if (existsSync(ts)) {
        const ccp = new ToPHPCompiler({
            tsconfigPath,
            nsPrefix: 'san\\components\\test\\'
        })
        const component = new ComponentParser(ts, tsconfigPath).parseComponent()
        const ccj = new ToJSCompiler(tsconfigPath)
        componentClass = ccj.compileAndRun(component.get(ts))['default']
        code += ccp.compileComponent(component)
    } else {
        const js = join(caseDir, 'component.js')
        componentClass = require(js)
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

export function compileAllToPHP () {
    for (const caseName of cases) compileToPHP(caseName)
}

export function renderByJS (caseName) {
    return exec(resolve(__dirname, `../../bin/render.js`), [caseName])
}

export function renderByPHP (caseName) {
    return exec(resolve(__dirname, `../../bin/render.php`), [caseName])
}
