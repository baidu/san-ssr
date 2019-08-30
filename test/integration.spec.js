const { existsSync, readFileSync, readdirSync } = require('fs')
const { resolve, join } = require('path')
const { render } = require('../src/render')
const caseRoot = resolve(__dirname, 'cases')
const files = readdirSync(caseRoot)
const compile = require('../src/compile')

for (const dir of files) {
    const caseDir = resolve(caseRoot, dir)
    const htmlPath = join(caseDir, 'result.html')
    const phpPath = join(caseDir, 'ssr.php')
    const expected = readFileSync(htmlPath, 'utf8')

    // if (dir !== 'load-success') continue

    it('js: ' + dir, function () {
        expect(render(dir, 'js')).toBe(expected)
    })

    it('php: ' + dir, function () {
        compile.php(dir)
        expect(render(dir, 'php')).toBe(expected)
    })
}
