import { ls, compileComponent, compileJS, jsExists, tsExists, compileTS, getRenderArguments, readExpected, renderOnthefly, caseRoots } from '../src/fixtures/case'
import { join } from 'path'
import { parseSanHTML } from '../src/index'
import type { RenderOptions } from '../src/index'
import { existsSync } from 'fs'
import { execSync } from 'child_process'
import type { GlobalContext } from '../src/models/global-context'
import type { Renderer } from '../src/models/renderer'

export interface SsrSpecConfig {
    enabled: {
        tssrc?: boolean
        jssrc?: boolean
        comsrc?: boolean
        comrdr?: boolean
    }
    context?: GlobalContext
    beforeHook?: (type: keyof SsrSpecConfig['enabled']) => void
    afterHook?: (type: keyof SsrSpecConfig['enabled']) => void
    compileOptions?: RenderOptions
}

// 每次执行前，把之前的产物删掉
caseRoots.forEach(caseRoot => {
    execSync(`rm -rf ${caseRoot}/**/output`)
})

// npm run e2e xxx
const caseName = process.argv[3]
const cases = caseName ? ls().filter(item => item.caseName === caseName) : ls()
if (cases.length === 0) {
    console.warn(`no case found for ${caseName}`)
}

for (const { caseName, caseRoot } of cases) {
    const [expectedData, expectedHtml] = parseSanHTML(readExpected(caseName, caseRoot))
    const ssrSpec = {
        enabled: {
            jssrc: true,
            comsrc: true,
            comrdr: true,
            tssrc: true
        },
        compileOptions: {}
    } as SsrSpecConfig
    const ssrSpecPath = join(caseRoot, caseName, 'ssr-spec.ts')
    if (existsSync(ssrSpecPath)) {
        Object.assign(ssrSpec, require(ssrSpecPath).default)
    }

    if (tsExists(caseName, caseRoot)) {
        if (ssrSpec.enabled.tssrc) {
            it('render to source (TypeScript): ' + caseName, async function () {
                ssrSpec.beforeHook && ssrSpec.beforeHook('tssrc')

                // compile
                const folderName = getRandomStr() + '_tssrc'
                compileTS(caseName, caseRoot, folderName)

                ssrSpec.afterHook && ssrSpec.afterHook('tssrc')

                // render
                const render = require(join(caseRoot, caseName, 'output', folderName, 'ssr.js'))
                const got = render(...getRenderArguments(caseName, caseRoot))
                const [data, html] = parseSanHTML(got)

                expect(data).toEqual(expectedData)
                expect(html).toEqual(expectedHtml)
            })
        }
    }

    if (jsExists(caseName, caseRoot)) {
        if (ssrSpec.enabled.jssrc) {
            it('js to source: ' + caseName, async function () {
                ssrSpec.beforeHook && ssrSpec.beforeHook('jssrc')

                // compile
                const folderName = getRandomStr() + '_jssrc'
                compileJS(caseName, caseRoot, false, folderName)

                ssrSpec.afterHook && ssrSpec.afterHook('jssrc')

                // render
                const render = require(join(caseRoot, caseName, 'output', folderName, 'ssr.js')) as Renderer
                // 测试在 strict mode，因此需要手动传入 require
                const got = render(...getRenderArguments(caseName, caseRoot, { parentCtx: { context: ssrSpec && ssrSpec.context } }))
                const [data, html] = parseSanHTML(got)

                expect(data).toEqual(expectedData)
                expect(html).toEqual(expectedHtml)
            })
        }

        if (ssrSpec.enabled.comsrc) {
            it('component to source: ' + caseName, async function () {
                ssrSpec.beforeHook && ssrSpec.beforeHook('comsrc')

                // compile
                const folderName = getRandomStr() + '_comsrc'
                compileComponent(caseName, caseRoot, false, folderName, ssrSpec.compileOptions)

                ssrSpec.afterHook && ssrSpec.afterHook('comsrc')

                // render
                const render = require(join(caseRoot, caseName, 'output', folderName, 'ssr.js')) as Renderer

                // 测试在 strict mode，因此需要手动传入 require
                const info = {
                    parentCtx: { context: ssrSpec && ssrSpec.context }
                } as Parameters<Renderer>[1]
                if (ssrSpec.compileOptions.useProvidedComponentClass) {
                    info.ComponentClass = require(join(caseRoot, caseName, 'component.js'))
                }
                const got = render(...getRenderArguments(caseName, caseRoot, info))
                const [data, html] = parseSanHTML(got)

                expect(data).toEqual(expectedData)
                expect(html).toEqual(expectedHtml)
            })
        }

        if (ssrSpec.enabled.comrdr) {
            ssrSpec.beforeHook && ssrSpec.beforeHook('comrdr')
            it('component to renderer: ' + caseName, async function () {
                const got = renderOnthefly(caseName, caseRoot)
                const [data, html] = parseSanHTML(got)

                expect(data).toEqual(expectedData)
                expect(html).toEqual(expectedHtml)
            })
            ssrSpec.afterHook && ssrSpec.afterHook('comrdr')
        }
    }
}

function getRandomStr () {
    return Math.random().toString(36).slice(2)
}
