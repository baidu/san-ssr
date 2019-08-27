const { readFileSync, readdirSync } = require('fs')
const san = require('../src/ssr')
const { resolve, join } = require('path')
const caseRoot = resolve(__dirname, 'cases')
const files = readdirSync(caseRoot)

for (const dir of files) {
    const caseDir = resolve(caseRoot, dir)
    const expected = readFileSync(join(caseDir, 'result.html'), 'utf8')
    const component = join(caseDir, 'component.js')
    const data = join(caseDir, 'data.json')

    // if (dir === 'load-success')
    it(dir, function () {
        expect(render(component, data)).toBe(expected)
    })
}

function render (component, data) {
    const ComponentClass = require(component)
    const rDate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/

    const renderer = san.compileToRenderer(ComponentClass)
    const componentData = JSON.parse(readFileSync(data, 'utf8'), (k, v) => {
        if (rDate.test(v)) {
            return new Date(v)
        }
        return v
    })

    const html = renderer(componentData)
    return html
}
