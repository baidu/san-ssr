const { readFileSync, readdirSync } = require('fs')
const { resolve, join } = require('path')
const { renderByJS, renderByPHP, compileAllToPHP, compileAllToJS } = require('../dist/bin/case')

const caseRoot = resolve(__dirname, 'cases')
const files = readdirSync(caseRoot)

// compileAllToJS()
compileAllToPHP()

for (const caseName of files) {
    const caseDir = resolve(caseRoot, caseName)
    const htmlPath = join(caseDir, 'result.html')
    const phpPath = join(caseDir, 'ssr.php')
    const expected = readFileSync(htmlPath, 'utf8')

    it(caseName, function () {
        // expect(renderByJS(caseName)).toBe(expected)
        expect(renderByPHP(caseName)).toBe(expected)
    })
}
