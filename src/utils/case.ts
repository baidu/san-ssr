import camelCase from 'camelcase'
import { readdirSync, writeFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { Target, SanProject } from '../models/san-project'
import debugFactory from 'debug'
import ProgressBar = require('progress')

const jsSSRUnables = ['multi-files']
const debug = debugFactory('case')
const caseRoot = resolve(__dirname, '../../test/cases')
const tsConfigFilePath = resolve(__dirname, '../../test/tsconfig.json')
const cases = readdirSync(caseRoot)
const sanProject1 = new SanProject({
    tsConfigFilePath,
    sanssr: '../../..'
})
const sanProject2 = new SanProject({
    tsConfigFilePath,
    sanssr: '../../..'
})
const multiFileCases = ['multi-component-files', 'multi-files']

export function supportJSSSR (caseName) {
    return !jsSSRUnables.includes(caseName)
}

export function supportE2E (caseName) {
    return !multiFileCases.includes(caseName)
}

export function compileToJS (caseName) {
    debug('compileToJS', caseName)
    const ts = join(caseRoot, caseName, 'component.ts')
    const js = resolve(caseRoot, caseName, 'component.js')
    const targetCode = sanProject1.compile(existsSync(js) ? js : ts, Target.js)

    writeFileSync(join(caseRoot, caseName, 'ssr.js'), targetCode)
}

export function compileToPHP (caseName) {
    const ts = join(caseRoot, caseName, 'component.ts')
    const js = resolve(caseRoot, caseName, 'component.js')
    const targetCode = sanProject2.compile(
        existsSync(ts) ? ts : js,
        Target.php,
        { nsPrefix: `san\\${camelCase(caseName)}\\` }
    )

    writeFileSync(join(caseRoot, caseName, 'ssr.php'), targetCode)
}

export function compileAllToJS () {
    const p = new ProgressBar(
        ':current/:total (:elapseds) compiling :caseName',
        { total: cases.length }
    )
    for (const caseName of cases) {
        if (!supportJSSSR(caseName)) {
            p.tick()
            continue
        }
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
