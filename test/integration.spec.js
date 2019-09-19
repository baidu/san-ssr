const { readFileSync, readdirSync } = require('fs')
const { resolve, join } = require('path')
const { parseHtml } = require('../dist/utils/case')
const { renderByJS, compileAllToJS, renderByPHP, compileAllToPHP, compileToPHP, compileToJS } = require('../dist/bin/case')

const caseRoot = resolve(__dirname, 'cases')
const files = readdirSync(caseRoot)

jest.setTimeout(10000)

for (const caseName of files) {
    // if (caseName !== 'nest-for-computed') continue

    const caseDir = resolve(caseRoot, caseName)
    const htmlPath = join(caseDir, 'result.html')
    const [expectedData, expectedHtml] = parseHtml(readFileSync(htmlPath, 'utf8'))

    it('js:' + caseName, function () {
        const [data, html] = parseHtml(renderByJS(caseName))

        expect(data).toEqual(expectedData)
        expect(html).toEqual(expectedHtml)
    })

    it('php:' + caseName, async function () {
        const [data, html] = parseHtml(renderByPHP(caseName))

        expect(data).toEqual(expectedData)
        expect(html).toEqual(expectedHtml)
    })
}
