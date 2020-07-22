import { readFileSync, lstatSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { SanProject } from '../models/san-project'
import ToJSCompiler from '../target-js'
import debugFactory from 'debug'
import { compileToRenderer } from '../index'

const debug = debugFactory('case')
export const caseRoot = join(__dirname, '../../node_modules/san-html-cases/src')
const tsConfigFilePath = join(__dirname, '../../test/tsconfig.json')
const sanProject = new SanProject(tsConfigFilePath)

export function tsExists (caseName: string) {
    return existsSync(join(caseRoot, caseName, 'component.ts'))
}

export function ls () {
    return readdirSync(caseRoot)
        .filter(caseName => lstatSync(join(caseRoot, caseName)).isDirectory())
}

export function readExpected (caseName: string) {
    const htmlPath = join(caseRoot, caseName, 'expected.html')
    return readFileSync(htmlPath, 'utf8')
}

export function compile (caseName: string, bareFunctionBody: boolean) {
    debug('compile js', caseName)
    const caseDir = join(caseRoot, caseName)
    const jsFile = join(caseDir, 'component.js')
    const ssrOnly = /-so/.test(caseName)
    const targetCode = sanProject.compile(
        jsFile,
        ToJSCompiler,
        { ssrOnly, bareFunctionBody }
    )
    return targetCode
}

export function compileTS (caseName: string, bareFunctionBody: boolean) {
    debug('compile ts', caseName)
    const caseDir = join(caseRoot, caseName)
    const tsFile = join(caseDir, 'component.ts')
    const ssrOnly = /-so/.test(caseName)
    const targetCode = sanProject.compile(
        tsFile,
        ToJSCompiler,
        { ssrOnly, bareFunctionBody }
    )
    return targetCode
}

export function compileCaseToRenderer (caseName: string) {
    const caseDir = join(caseRoot, caseName)
    const ComponentClass = require(join(caseDir, 'component.js'))
    return compileToRenderer(ComponentClass, {
        ssrOnly: /-so/.test(caseDir)
    })
}

export function readCaseData (caseName: string) {
    const caseDir = join(caseRoot, caseName)
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
