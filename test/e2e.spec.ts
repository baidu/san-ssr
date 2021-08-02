import { ls, compileComponent, compileJS, jsExists, tsExists, compileTS, getRenderArguments, readExpected, renderOnthefly } from '../src/fixtures/case'
import { join } from 'path'
import { parseSanHTML } from '../src/index'

for (const { caseName, caseRoot } of ls()) {
    const [expectedData, expectedHtml] = parseSanHTML(readExpected(caseName, caseRoot))

    if (tsExists(caseName, caseRoot)) {
        it('render to source (TypeScript): ' + caseName, async function () {
            compileTS(caseName, caseRoot)
            const render = require(join(caseRoot, caseName, 'ssr.js'))
            const got = render(...getRenderArguments(caseName, caseRoot))
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })
    }

    if (jsExists(caseName, caseRoot)) {
        it('js to source: ' + caseName, async function () {
            const code = compileJS(caseName, caseRoot, true)
            // eslint-disable-next-line
            const render = new Function('data', 'noDataOutput', 'require', code)
            // 测试在 strict mode，因此需要手动传入 require
            const got = render(...getRenderArguments(caseName, caseRoot), require)
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })

        it('component to source: ' + caseName, async function () {
            const code = compileComponent(caseName, caseRoot, true)
            // eslint-disable-next-line
            const render = new Function('data', 'noDataOutput', 'require', code)
            // 测试在 strict mode，因此需要手动传入 require
            const got = render(...getRenderArguments(caseName, caseRoot), require)
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
