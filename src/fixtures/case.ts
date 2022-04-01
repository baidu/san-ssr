import { writeFileSync, readFileSync, lstatSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { SanProject } from '../models/san-project'
import ToJSCompiler from '../target-js'
import debugFactory from 'debug'
import { compileToRenderer } from '../index'
import mkdirp from 'mkdirp'
import type { RenderOptions } from '../compilers/renderer-options'
import type { Renderer } from '../models/renderer'

const debug = debugFactory('case')
export const caseRoots = [
    join(__dirname, '../../node_modules/san-html-cases/src'),
    join(__dirname, '../../test/cases')
]
const tsConfigFilePath = join(__dirname, '../../test/tsconfig.json')
const sanProject = new SanProject(tsConfigFilePath)
const importHelpers = join(__dirname, '../../dist/runtime/helpers')

export function jsExists (caseName: string, caseRoot: string) {
    return existsSync(join(caseRoot, caseName, 'component.js'))
}

export function tsExists (caseName: string, caseRoot: string) {
    return existsSync(join(caseRoot, caseName, 'component.ts'))
}

export function ls () {
    const cases = [] as {
        caseName: string
        caseRoot: string
    }[]
    for (const caseRoot of caseRoots) {
        cases.push(
            ...readdirSync(caseRoot)
                .filter(caseName => lstatSync(join(caseRoot, caseName)).isDirectory())
                .map(caseName => ({ caseName, caseRoot }))
        )
    }
    return cases
}

export function readExpected (caseName: string, caseRoot: string) {
    const htmlPath = join(caseRoot, caseName, 'expected.html')
    return readFileSync(htmlPath, 'utf8')
}

export function compileJS (
    caseName: string,
    caseRoot: string,
    compileToFunctionBodyCode: boolean = false,
    folderName = ''
) {
    debug('compile js', caseName)
    const caseDir = join(caseRoot, caseName)
    const ssrOnly = /-so/.test(caseName)

    // 只编译 component.js
    if (compileToFunctionBodyCode) {
        const jsFile = join(caseDir, 'component.js')
        const targetCode = sanProject.compile(
            jsFile,
            ToJSCompiler,
            { ssrOnly, bareFunctionBody: compileToFunctionBodyCode, importHelpers }
        )
        return targetCode
    }

    mkdirp.sync(join(caseRoot, caseName, 'output', folderName))
    for (const file of readdirSync(caseDir).filter(file => file === 'component.js' || file.endsWith('.san.js'))) {
        const jsFile = join(caseDir, file)
        const targetCode = sanProject.compile(
            jsFile,
            ToJSCompiler,
            { ssrOnly, bareFunctionBody: compileToFunctionBodyCode, importHelpers }
        )
        const targetFile = join(caseRoot, caseName, 'output', folderName, file === 'component.js' ? 'ssr.js' : file)
        writeFileSync(targetFile, targetCode)
    }
}

export function compileComponent (
    caseName: string,
    caseRoot: string,
    compileToFunctionBodyCode: boolean = false,
    folderName = '',
    customOptions: Partial<RenderOptions>
) {
    debug('compile js', caseName)
    const caseDir = join(caseRoot, caseName)
    const ssrOnly = /-so/.test(caseName)

    const options = Object.assign({
        ssrOnly,
        bareFunctionBody: compileToFunctionBodyCode,
        importHelpers
    }, customOptions)

    // 只编译 component.js
    if (compileToFunctionBodyCode) {
        const jsFile = join(caseDir, 'component.js')
        const component = require(jsFile)
        const targetCode = sanProject.compile(
            component,
            ToJSCompiler,
            options
        )
        return targetCode
    }

    mkdirp.sync(join(caseRoot, caseName, 'output', folderName))
    for (const file of readdirSync(caseDir).filter(file => file === 'component.js' || file.endsWith('.san.js'))) {
        const jsFile = join(caseDir, file)
        const component = require(jsFile)
        const targetCode = sanProject.compile(
            component,
            ToJSCompiler,
            options
        )
        const targetFile = join(caseRoot, caseName, 'output', folderName, file === 'component.js' ? 'ssr.js' : file)
        writeFileSync(targetFile, targetCode)
    }
}

export function compileTS (caseName: string, caseRoot: string, folderName = '') {
    debug('compile ts', caseName)
    const caseDir = join(caseRoot, caseName)
    const ssrOnly = /-so/.test(caseName)
    mkdirp.sync(join(caseRoot, caseName, 'output', folderName))
    for (const file of readdirSync(caseDir).filter(file => /\.ts$/.test(file))) {
        const targetCode = sanProject.compile(
            join(caseDir, file),
            ToJSCompiler,
            { ssrOnly, importHelpers }
        )
        const targetFile = file === 'component.ts'
            ? join(caseDir, 'output', folderName, 'ssr.js')
            : join(caseDir, 'output', folderName, file.replace(/\.ts$/, '.js'))
        writeFileSync(targetFile, targetCode)
    }
}

export function compileCaseToRenderer (caseName: string, caseRoot: string) {
    const caseDir = join(caseRoot, caseName)
    const ComponentClass = require(join(caseDir, 'component.js'))
    return compileToRenderer(ComponentClass, {
        ssrOnly: /-so/.test(caseDir)
    })
}

export function readCaseData (caseName: string, caseRoot: string) {
    const caseDir = join(caseRoot, caseName)
    const dataJSPath = join(caseDir, 'data.js')
    if (existsSync(dataJSPath)) {
        return require(dataJSPath)
    }
    const dataPath = join(caseDir, 'data.json')
    return JSON.parse(readFileSync(dataPath, 'utf8'))
}

export function getRenderArguments (
    caseName: string,
    caseRoot: string,
    info: Partial<Parameters<Renderer>['1']> = {}
): Parameters<Renderer> {
    const data = readCaseData(caseName, caseRoot)
    const noDataOutput = /-ndo$/.test(caseName)
    return [data, Object.assign({
        noDataOutput
    }, info)]
}

export function renderOnthefly (caseName: string, caseRoot: string) {
    const render = compileCaseToRenderer(caseName, caseRoot)
    const data = readCaseData(caseName, caseRoot)
    const noDataOutput = /-ndo$/.test(caseName)
    return render(data, { noDataOutput })
}
