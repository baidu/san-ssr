const { lstatSync, readFileSync, readdirSync } = require('fs')
const { resolve, join } = require('path')
const { parseSanHTML, execCommandSync } = require('../dist/index')
const caseRoot = resolve(__dirname, 'cases')
const files = readdirSync(caseRoot)
const renderBySource = resolve(__dirname, `../bin/render-by-source.js`)
const renderOnthefly = resolve(__dirname, `../bin/render-onthefly.js`)

jest.setTimeout(10000)

for (const caseName of files) {
    const caseDir = resolve(caseRoot, caseName)
    if (!lstatSync(caseDir).isDirectory()) continue

    const htmlPath = join(caseDir, 'expected.html')
    const [expectedData, expectedHtml] = parseSanHTML(readFileSync(htmlPath, 'utf8'))

    it(caseName, async function () {
        const got1 = execCommandSync(renderBySource, [caseName])
        const [data1, html1] = parseSanHTML(got1)

        expect(data1).toEqual(expectedData)
        expect(html1).toEqual(expectedHtml)

        const got2 = execCommandSync(renderOnthefly, [caseName])
        const [data2, html2] = parseSanHTML(got2)

        expect(data2).toEqual(expectedData)
        expect(html2).toEqual(expectedHtml)
    })
}
