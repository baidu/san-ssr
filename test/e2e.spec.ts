import { ls, compileComponent, compileJS, jsExists, tsExists, compileTS, getRenderArguments, readExpected, renderOnthefly } from '../src/fixtures/case'
import { join } from 'path'
import { parseSanHTML } from '../src/index'
import { existsSync } from 'fs'

const caseName = process.argv[3]

let cases = ls().filter(item => caseName ? item.caseName === caseName : true)
if (cases.length === 0) {
    cases = ls()
}

for (const { caseName, caseRoot } of cases) {
    const [expectedData, expectedHtml] = parseSanHTML(readExpected(caseName, caseRoot))
    let ssrSpec = {
        enabled: {
            jssrc: true,
            comsrc: true,
            comrdr: true,
            tssrc: true
        }
    }
    const ssrSpecPath = join(caseRoot, caseName, 'ssr-spec.js')
    if (existsSync(ssrSpecPath)) {
        ssrSpec = require(ssrSpecPath)
    }

    if (tsExists(caseName, caseRoot)) {
        ssrSpec.enabled.tssrc && it('render to source (TypeScript): ' + caseName, async function () {
            const folderName = getRandomStr()
            compileTS(caseName, caseRoot, folderName)
            const render = require(join(caseRoot, caseName, 'output', folderName, 'ssr.js'))
            const got = render(...getRenderArguments(caseName, caseRoot))
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })
    }

    if (jsExists(caseName, caseRoot)) {
        ssrSpec.enabled.jssrc && it('js to source: ' + caseName, async function () {
            const folderName = getRandomStr()
            compileJS(caseName, caseRoot, false, folderName)
            const render = require(join(caseRoot, caseName, 'output', folderName, 'ssr.js'))
            const ssrSpecPath = join(caseRoot, `${caseName}/ssr-spec.js`)
            if (existsSync(ssrSpecPath)) {
                require(ssrSpecPath)
            }
            // 测试在 strict mode，因此需要手动传入 require
            const got = render(...getRenderArguments(caseName, caseRoot))
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })

        ssrSpec.enabled.comsrc && it('component to source: ' + caseName, async function () {
            const folderName = getRandomStr()
            compileComponent(caseName, caseRoot, false, folderName)
            // eslint-disable-next-line
            const render = require(join(caseRoot, caseName, 'output', folderName, 'ssr.js'))
            // 测试在 strict mode，因此需要手动传入 require
            const got = render(...getRenderArguments(caseName, caseRoot))
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })

        ssrSpec.enabled.comrdr && it('component to renderer: ' + caseName, async function () {
            const got = renderOnthefly(caseName, caseRoot)
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })
    }
}

function getRandomStr () {
    return Math.random().toString(36).slice(2)
}
