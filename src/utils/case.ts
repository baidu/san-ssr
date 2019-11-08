import camelCase from 'camelcase'
import { startMeasure } from '../utils/timing'
import { readdirSync, writeFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { SanProject } from '../models/san-project'
import { Target } from '../models/target'
import debugFactory from 'debug'

process.env.SAN_SSR_PACKAGE_NAME = '../../..'

const debug = debugFactory('case')
const caseRoot = resolve(__dirname, '../../test/cases')
const tsConfigFilePath = resolve(__dirname, '../../test/tsconfig.json')
const cases = readdirSync(caseRoot)
const sanProject = new SanProject({
    tsConfigFilePath,
    modules: {
        './php': 'exports.htmlspecialchars = x => x' // case: depend-on-declaration
    }
})

export function supportJSSSR (caseName) {
    return !['multi-files', 'import-files-from-parent-directory', 'depend-on-declaration'].includes(caseName)
}

export function supportE2E (caseName) {
    return !['multi-component-files', 'multi-files', 'import-files-from-parent-directory', 'depend-on-declaration'].includes(caseName)
}

export function compileToJS (caseName) {
    debug('compileToJS', caseName)
    const ts = join(caseRoot, caseName, 'component.ts')
    const js = resolve(caseRoot, caseName, 'component.js')
    const targetCode = sanProject.compile(existsSync(js) ? js : ts, Target.js)

    writeFileSync(join(caseRoot, caseName, 'ssr.js'), targetCode)
}

export function compileToPHP (caseName) {
    const ts = join(caseRoot, caseName, 'component.ts')
    const js = resolve(caseRoot, caseName, 'component.js')
    const targetCode = sanProject.compile(
        existsSync(ts) ? ts : js,
        Target.php,
        {
            nsPrefix: `san\\${camelCase(caseName)}\\`,
            modules: {
                './php': {
                    required: true
                }
            }
        }
    )

    writeFileSync(join(caseRoot, caseName, 'ssr.php'), targetCode)
}

export function compileAllToJS () {
    const timing = startMeasure()
    for (const caseName of cases) {
        if (!supportJSSSR(caseName)) {
            continue
        }
        console.log(`compiling ${caseName} to js`)
        compileToJS(caseName)
    }
    console.log('compiled in', timing.duration())
}

export function compileAllToPHP () {
    const timing = startMeasure()
    for (const caseName of cases) {
        console.log(`compiling ${caseName} to php`)
        compileToPHP(caseName)
    }
    console.log('compiled in', timing.duration())
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
