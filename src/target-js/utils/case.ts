/**
 * Note:
 *   * this file is ONLY intended for development usage
 *   * do NOT import this file in other source files
 */
import { startMeasure } from './timing'
import { readdirSync, writeFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { SanProject } from '../../models/san-project'
import ToJSCompiler from '../index'
import debugFactory from 'debug'

const debug = debugFactory('case')
const caseRoot = resolve(__dirname, '../../../test/cases')
const tsConfigFilePath = resolve(__dirname, '../../../test/tsconfig.json')
const cases = readdirSync(caseRoot)
const sanProject = new SanProject({ tsConfigFilePath })

export function compile (caseName) {
    debug('compile', caseName)
    const tsFile = join(caseRoot, caseName, 'component.ts')
    const jsFile = resolve(caseRoot, caseName, 'component.js')
    const targetCode = sanProject.compile(
        existsSync(jsFile) ? jsFile : tsFile,
        ToJSCompiler
    )

    writeFileSync(join(caseRoot, caseName, 'ssr.js'), targetCode)
}

export function compileAll () {
    const timing = startMeasure()
    for (const caseName of cases) {
        console.log(`compiling ${caseName} to js`)
        compile(caseName)
    }
    console.log('compiled in', timing.duration())
}
