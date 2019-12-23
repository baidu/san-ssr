import { writeFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { SanProject } from '../models/san-project'
// import ToJSCompiler from '../target-js/index'
import debugFactory from 'debug'

const debug = debugFactory('case')
const caseRoot = resolve(__dirname, '../../test/cases')
const tsConfigFilePath = resolve(__dirname, '../../test/tsconfig.json')
const sanProject = new SanProject({ tsConfigFilePath })

export function compile (caseName) {
    debug('compile', caseName)
    const tsFile = join(caseRoot, caseName, 'component.ts')
    const jsFile = resolve(caseRoot, caseName, 'component.js')
    const targetCode = sanProject.compile(
        existsSync(jsFile) ? jsFile : tsFile
    )

    writeFileSync(join(caseRoot, caseName, 'ssr.js'), targetCode)
}

export function parseSanHTML (str: string) {
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

export function assertSanHTMLEqual (expected, got) {
    const [data0, html0] = parseSanHTML(expected)
    const [data1, html1] = parseSanHTML(got)
    return deepEqual(data0, data1) && html0 === html1
}

function deepEqual (lhs, rhs) {
    if (typeof lhs === 'object' && lhs !== null) {
        const keys = new Set([...Object.keys(lhs), ...Object.keys(rhs)])
        for (const key of keys) {
            if (!deepEqual(lhs[key], rhs[key])) return false
        }
        return true
    }
    return JSON.stringify(lhs) === JSON.stringify(rhs)
}
