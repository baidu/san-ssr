import { ComponentParser } from '../parser/component-parser'
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs'
import { PHPEmitter } from '../emitters/php-emitter'
import { JSEmitter } from '../emitters/js-emitter'
import { resolve, join } from 'path'
import { compileToSource as compileToJSSource } from '../js-ssr'
import { ToPHPCompiler } from '../transpilers/to-php-compiler'
import { ToJSCompiler } from '../transpilers/to-js-compiler'
import camelCase from 'camelcase'
import ProgressBar = require('progress')

const caseRoot = resolve(__dirname, '../../test/cases')
const tsconfigPath = resolve(__dirname, '../../test/tsconfig.json')
const cases = readdirSync(caseRoot)
const toJSCompiler = new ToJSCompiler(tsconfigPath)
const toPHPCompiler = new ToPHPCompiler({
    tsconfigPath,
    nsPrefix: 'san\\components\\test\\'
})
const parser = new ComponentParser(tsconfigPath)

export function compileToJS (caseName) {
    const caseDir = join(caseRoot, caseName)
    const ts = join(caseDir, 'component.ts')
    const js = resolve(caseDir, 'component.js')
    const emitter = new JSEmitter()
    emitter.writeRuntime()
    let componentClass

    const component = parser.parseComponent(existsSync(ts) && ts, existsSync(js) && js)
    if (existsSync(js)) {
        componentClass = toJSCompiler.run(readFileSync(js, 'utf8'))
    } else {
        componentClass = toJSCompiler.compileAndRun(component.getComponentSourceFile())['default']
    }

    const fn = compileToJSSource(componentClass)
    writeFileSync(join(caseDir, 'ssr.js'), `module.exports = ${fn}`)
}

export function compileToPHP (caseName) {
    const caseDir = join(caseRoot, caseName)
    const ts = join(caseDir, 'component.ts')
    const js = resolve(caseDir, 'component.js')
    const emitter = new PHPEmitter()

    const component = parser.parseComponent(existsSync(ts) && ts, existsSync(js) && js)
    let ComponentClass
    if (existsSync(ts)) {
        ComponentClass = toJSCompiler.compileAndRun(component.getComponentSourceFile())['default']
    } else {
        ComponentClass = toJSCompiler.run(readFileSync(js, 'utf8'))
    }
    toPHPCompiler.compileComponent(component, ComponentClass, emitter, {
        ns: `san\\renderer\\${camelCase(caseName)}`
    })

    writeFileSync(join(caseDir, 'ssr.php'), emitter.fullText())
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
