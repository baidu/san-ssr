const { lstatSync, readFileSync, readdirSync } = require('fs')
const { resolve, join } = require('path')
const { parseSanHTML, execCommandSync } = require('../dist/index')
const caseRoot = resolve(__dirname, 'cases')
const files = readdirSync(caseRoot)
const renderBin = resolve(__dirname, `../bin/render.js`)

jest.setTimeout(10000)

for (const caseName of files) {
    const caseDir = resolve(caseRoot, caseName)
    if (lstatSync(caseDir).isDirectory()) continue

    const htmlPath = join(caseDir, 'expected.html')
    const [expectedData, expectedHtml] = parseSanHTML(readFileSync(htmlPath, 'utf8'))

    it(caseName, async function () {
        const got = execCommandSync(renderBin, [caseName])
        const [data, html] = parseSanHTML(got)

        expect(data).toEqual(expectedData)
        expect(html).toEqual(expectedHtml)
    })
}
