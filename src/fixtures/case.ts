import { startMeasure } from './timing'
import { readFileSync, lstatSync, readdirSync, writeFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { SanProject } from '../models/san-project'
import ToJSCompiler from '../target-js'
import debugFactory from 'debug'
import { compileToRenderer } from '../index'

const debug = debugFactory('case')
const caseRoot = resolve(__dirname, '../../test/cases')
const tsConfigFilePath = resolve(__dirname, '../../test/tsconfig.json')
const cases = readdirSync(caseRoot)
const sanProject = new SanProject({ tsConfigFilePath })

export function ls () {
    return readdirSync(caseRoot)
        .filter(caseName => lstatSync(resolve(caseRoot, caseName)).isDirectory())
}

export function readExpected (caseName: string) {
    const htmlPath = join(caseRoot, caseName, 'expected.html')
    return readFileSync(htmlPath, 'utf8')
}

export function compile (caseName) {
    debug('compile', caseName)
    const caseDir = join(caseRoot, caseName)
    if (caseDir) {
        if (!lstatSync(caseDir).isDirectory()) return
    }

    const tsFile = join(caseDir, 'component.ts')
    const jsFile = resolve(caseDir, 'component.js')
    const noTemplateOutput = caseName.indexOf('notpl') > -1
    const targetCode = sanProject.compile(
        existsSync(tsFile) ? tsFile : jsFile,
        ToJSCompiler, {
            noTemplateOutput
        }
    )

    writeFileSync(join(caseDir, 'ssr.js'), targetCode)
}

export function compileAll () {
    const timing = startMeasure()
    for (const caseName of cases) {
        console.log(`compiling ${caseName} to js`)
        compile(caseName)
    }
    console.log('compiled in', timing.duration())
}

export function compileCaseToRenderer (caseName: string) {
    const caseDir = resolve(caseRoot, caseName)
    const ComponentClass = require(join(caseDir, 'component.js'))
    return compileToRenderer(ComponentClass, {
        noTemplateOutput: caseDir.indexOf('notpl') > -1
    })
}

export function readCaseData (caseName: string) {
    const caseDir = resolve(caseRoot, caseName)
    const dataJSPath = join(caseDir, 'data.js')
    if (existsSync(dataJSPath)) {
        return require(dataJSPath)
    }
    const dataPath = join(caseDir, 'data.json')
    return JSON.parse(readFileSync(dataPath, 'utf8'))
}

export function renderBySource (caseName: string) {
    const render = require(`../../test/cases/${caseName}/ssr.js`)
    const data = readCaseData(caseName)
    const noDataOutput = /-ndo$/.test(caseName)
    return render(data, noDataOutput)
}

export function renderOnthefly (caseName: string) {
    const render = compileCaseToRenderer(caseName)
    const data = readCaseData(caseName)
    const noDataOutput = /-ndo$/.test(caseName)
    return render(data, noDataOutput)
}
