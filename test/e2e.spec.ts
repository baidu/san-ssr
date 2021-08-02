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

    if (tsExists(caseName, caseRoot)) {
        it('render to source (TypeScript): ' + caseName, async function () {
            compileTS(caseName, caseRoot)
            const render = require(join(caseRoot, caseName, 'output', 'ssr.js'))
            const got = render(...getRenderArguments(caseName, caseRoot))
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })
    }

    if (jsExists(caseName, caseRoot)) {
        it('js to source: ' + caseName, async function () {
            compileJS(caseName, caseRoot)
            const render = require(join(caseRoot, caseName, 'output/ssr.js'))
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

        it('component to source: ' + caseName, async function () {
            compileComponent(caseName, caseRoot)
            // eslint-disable-next-line
            const render = require(join(caseRoot, caseName, 'output/ssr.js'))
            // 测试在 strict mode，因此需要手动传入 require
            const got = render(...getRenderArguments(caseName, caseRoot))
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })

        it('component to renderer: ' + caseName, async function () {
            const got = renderOnthefly(caseName, caseRoot)
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })
    }
}
