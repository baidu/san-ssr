const { readFileSync, readdirSync } = require('fs')
const { resolve, join } = require('path')
const { renderByJS, compileAllToJS, renderByPHP, compileAllToPHP, compileToPHP, compileToJS } = require('../dist/bin/case')

const caseRoot = resolve(__dirname, 'cases')
const files = readdirSync(caseRoot)

jest.setTimeout(10000)

for (const caseName of files) {
    // if (caseName !== 'nest-for-computed') continue

    const caseDir = resolve(caseRoot, caseName)
    const htmlPath = join(caseDir, 'result.html')
    const expected = readFileSync(htmlPath, 'utf8')

    it('js:' + caseName, function () {
        expect(renderByJS(caseName)).toBe(expected)
    })

    it('php:' + caseName, async function () {
        expect(renderByPHP(caseName)).toBe(expected)
    })
}
