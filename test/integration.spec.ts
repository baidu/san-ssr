import { ls, compile, tsExists, compileTS, getRenderArguments, readExpected, renderOnthefly } from '../src/fixtures/case'
import { parseSanHTML } from '../src/index'

for (const caseName of ls()) {
    const [expectedData, expectedHtml] = parseSanHTML(readExpected(caseName))

    it('render to source: ' + caseName, async function () {
        const code = compile(caseName, true)
        // eslint-disable-next-line
        const render = new Function('data', 'noDataOutput', 'require', code)
        // 测试在 strict mode，因此需要手动传入 require
        const got = render(...getRenderArguments(caseName), require)
        const [data, html] = parseSanHTML(got)

        expect(data).toEqual(expectedData)
        expect(html).toEqual(expectedHtml)
    })

    if (tsExists(caseName)) {
        it('render to source (TypeScript): ' + caseName, async function () {
            const code = compileTS(caseName, true)
            // eslint-disable-next-line
            const render = new Function('data', 'noDataOutput', 'require', code)
            // 测试在 strict mode，因此需要手动传入 require
            const got = render(...getRenderArguments(caseName), require)
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })
    }

    it('render to renderer: ' + caseName, async function () {
        const got = renderOnthefly(caseName)
        const [data, html] = parseSanHTML(got)

        expect(data).toEqual(expectedData)
        expect(html).toEqual(expectedHtml)
    })
}
