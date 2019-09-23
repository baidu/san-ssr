import { ComponentParser } from '../parser/component-parser'
import { emitRuntimeInPHP } from '../emitters/runtime'
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs'
import { PHPEmitter } from '../emitters/php-emitter'
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
    const js = resolve(caseDir, 'component.js')
    let componentClass

    if (existsSync(js)) {
        componentClass = require(js)
    } else {
        const component = parser.parseComponent(ts)
        componentClass = ccj.compileAndRun(component.getComponentSourceFile())['default']
    }

    const fn = compileToJSSource(componentClass)
    writeFileSync(join(caseDir, 'ssr.js'), `module.exports = ${fn}`)
}

export function compileToPHP (caseName) {
    const caseDir = join(caseRoot, caseName)
    const ts = join(caseDir, 'component.ts')
    const emitter = new PHPEmitter()
    let componentClass

    emitRuntimeInPHP(emitter)

    if (existsSync(ts)) {
        const component = parser.parseComponent(ts)
        componentClass = ccj.compileAndRun(component.getComponentSourceFile())['default']
        ccp.compileComponent(component, emitter)
    } else {
        const js = resolve(caseDir, 'component.js')
        componentClass = ccj.run(readFileSync(js, 'utf8'))
    }

    emitter.beginNamespace(`san\\renderer\\${camelCase(caseName)}`)
    emitter.writeLine(`use \\san\\runtime\\_;`)
    emitter.writeLines(
        compileToPHPSource(
            componentClass,
            { funcName: 'render' }
        )
    )
    emitter.endNamespace()

    writeFileSync(join(caseDir, 'ssr.php'), `<?php ${emitter.fullText()} ?>`)
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

export function parseHtml (str: string) {
    const begin = str.indexOf('<!--s-data:')
    let data = {}
    let html = str
    if (begin !== -1) {
        const end = str.indexOf('-->', begin)
        if (end !== -1) {
            data = JSON.parse(str.slice(begin + 11, end))
            html = str.slice(0, begin) + str.slice(end + 3)
        }
    }
    return [data, html]
}
