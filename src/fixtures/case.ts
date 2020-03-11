import { readFileSync, lstatSync, readdirSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { SanProject } from '../models/san-project'
import ToJSCompiler from '../target-js'
import debugFactory from 'debug'
import { compileToRenderer } from '../index'

const debug = debugFactory('case')
const caseRoot = resolve(__dirname, '../../test/cases')
const tsConfigFilePath = resolve(__dirname, '../../test/tsconfig.json')
const sanProject = new SanProject({ tsConfigFilePath })

export function ls () {
    return readdirSync(caseRoot)
        .filter(caseName => lstatSync(resolve(caseRoot, caseName)).isDirectory())
}

export function readExpected (caseName: string) {
    const htmlPath = join(caseRoot, caseName, 'expected.html')
    return readFileSync(htmlPath, 'utf8')
}

export function compile (caseName: string, bareFunctionBody: boolean) {
    debug('compile', caseName)
    const caseDir = join(caseRoot, caseName)
    const tsFile = join(caseDir, 'component.ts')
    const jsFile = resolve(caseDir, 'component.js')
    const noTemplateOutput = caseName.indexOf('notpl') > -1
    const targetCode = sanProject.compile(
        existsSync(tsFile) ? tsFile : jsFile,
        ToJSCompiler, {
            noTemplateOutput,
            bareFunctionBody
        }
    )
    return targetCode
}

export function compileCaseToRenderer (caseName: string) {
    const caseDir = resolve(caseRoot, caseName)
    const js = join(caseDir, 'component.js')
    const ts = join(caseDir, 'component.ts')
    const ComponentClass = existsSync(js) ? require(js) : ts
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

export function getRenderArguments (caseName: string) {
    const data = readCaseData(caseName)
    const noDataOutput = /-ndo$/.test(caseName)
    return [data, noDataOutput]
}

export function renderOnthefly (caseName: string) {
    const render = compileCaseToRenderer(caseName)
    const data = readCaseData(caseName)
    const noDataOutput = /-ndo$/.test(caseName)
    return render(data, noDataOutput)
}
