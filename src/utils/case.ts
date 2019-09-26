import camelCase from 'camelcase'
import { readdirSync, writeFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { ToPHPCompiler } from '../transpilers/to-php-compiler'
import { ToJSCompiler } from '../transpilers/to-js-compiler'
import ProgressBar = require('progress')

const caseRoot = resolve(__dirname, '../../test/cases')
const tsConfigFilePath = resolve(__dirname, '../../test/tsconfig.json')
const cases = readdirSync(caseRoot)
const toJSCompiler = new ToJSCompiler(tsConfigFilePath)
const toPHPCompiler = new ToPHPCompiler({
    tsConfigFilePath,
    removeExternals: ['../../..'],
    nsPrefix: 'san\\components\\test\\'
})

export function compileToJS (caseName) {
    const ts = join(caseRoot, caseName, 'component.ts')
    const js = resolve(caseRoot, caseName, 'component.js')

    const fn = existsSync(js)
        ? toJSCompiler.compileFromJS(js)
        : toJSCompiler.compileFromTS(ts)
    writeFileSync(join(caseRoot, caseName, 'ssr.js'), `module.exports = ${fn}`)
}

export function compileToPHP (caseName) {
    const ts = join(caseRoot, caseName, 'component.ts')
    const js = resolve(caseRoot, caseName, 'component.js')
    const options = {
        ns: `san\\renderer\\${camelCase(caseName)}`
    }

    const fn = existsSync(ts)
        ? toPHPCompiler.compileFromTS(ts, options)
        : toPHPCompiler.compileFromJS(js, options)
    writeFileSync(join(caseRoot, caseName, 'ssr.php'), fn)
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
