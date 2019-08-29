const { existsSync, readFileSync, readdirSync } = require('fs')
const { resolve, join } = require('path')
const { render } = require('../src/render')
const caseRoot = resolve(__dirname, 'cases')
const files = readdirSync(caseRoot)
const notExist = []

for (const dir of files) {
    const caseDir = resolve(caseRoot, dir)
    const htmlPath = join(caseDir, 'result.html')
    const phpPath = join(caseDir, 'ssr.php')
    const expected = readFileSync(htmlPath, 'utf8')

    // if (dir !== 'load-success') continue

    it('js: ' + dir, function () {
        expect(render(dir, 'js')).toBe(expected)
    })
    if (!existsSync(phpPath)) {
        notExist.push(dir)
        continue
    }
    it('php: ' + dir, function () {
        expect(render(dir, 'php')).toBe(expected)
    })
}

console.log(`${notExist.length} cases ssr.php not found: ${notExist.join(',')}`)
