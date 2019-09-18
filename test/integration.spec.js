const { readFileSync, readdirSync } = require('fs')
const { resolve, join } = require('path')
const { renderByJS, renderByPHP, compileToPHP, compileToJS } = require('../dist/bin/case')

const caseRoot = resolve(__dirname, 'cases')
const files = readdirSync(caseRoot)

for (const caseName of files) {
    // if (caseName !== 'nest-for-computed') continue

    const caseDir = resolve(caseRoot, caseName)
    const htmlPath = join(caseDir, 'result.html')
    const expected = readFileSync(htmlPath, 'utf8')

    it('js:' + caseName, function () {
        compileToJS(caseName)

        expect(renderByJS(caseName)).toBe(expected)
    })

    it('php:' + caseName, function () {
        compileToPHP(caseName)

        expect(renderByPHP(caseName)).toBe(expected)
    })
}
