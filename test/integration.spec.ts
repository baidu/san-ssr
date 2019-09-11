import { readFileSync, readdirSync } from 'fs'
import { resolve, join } from 'path'
import { renderByJS, renderByPHP, compileAllPHP, compileAllJS } from './case'

const caseRoot = resolve(__dirname, 'cases')
const files = readdirSync(caseRoot)

compileAllJS()
compileAllPHP()

for (const caseName of files) {
    const caseDir = resolve(caseRoot, caseName)
    const htmlPath = join(caseDir, 'result.html')
    const phpPath = join(caseDir, 'ssr.php')
    const expected = readFileSync(htmlPath, 'utf8')

    it('js: ' + caseName, function () {
        expect(renderByJS(caseName)).toBe(expected)
    })

    it('php: ' + caseName, function () {
        expect(renderByPHP(caseName)).toBe(expected)
    })
}
