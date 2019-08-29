const { readFileSync, readdirSync } = require('fs')
const san = require('../src/php-ssr')
const { resolve, join } = require('path')
const { read } = require('../src/data')
const caseRoot = resolve(__dirname, 'cases')
const files = readdirSync(caseRoot)

for (const dir of files) {
    const caseDir = resolve(caseRoot, dir)
    const expected = readFileSync(join(caseDir, 'result.html'), 'utf8')
    const component = join(caseDir, 'component.js')
    const data = join(caseDir, 'data.json')
    const noDataOutput = /-ndo$/.test(caseDir)

    // if (dir === 'load-success')
    it(dir, function () {
        expect(render(component, noDataOutput, data)).toBe(expected)
    })
}

function render (component, noDataOutput, datafile) {
    const ComponentClass = require(component)

    const renderer = san.compileToRenderer(ComponentClass)
    const componentData = read(datafile)

    const html = renderer(componentData, noDataOutput)
    return html
}
