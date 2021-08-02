import { ls, compileComponent, compileJS, jsExists, tsExists, compileTS, getRenderArguments, readExpected, renderOnthefly, caseRoots } from '../src/fixtures/case'
import { join } from 'path'
import { parseSanHTML } from '../src/index'
import { existsSync } from 'fs'
import { execSync } from 'child_process'

// 每次执行前，把之前的产物删掉
caseRoots.forEach(caseRoot => {
    execSync(`rm -rf ${caseRoot}/**/output`)
})

for (const { caseName, caseRoot } of ls()) {
    const [expectedData, expectedHtml] = parseSanHTML(readExpected(caseName, caseRoot))

    if (tsExists(caseName, caseRoot)) {
        it('render to source (TypeScript): ' + caseName, async function () {
            const folderName = getRandomStr() + '_tssrc'
            compileTS(caseName, caseRoot, folderName)
            const render = require(join(caseRoot, caseName, 'output', folderName, 'ssr.js'))
            const got = render(...getRenderArguments(caseName, caseRoot))
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })
    }

    if (jsExists(caseName, caseRoot)) {
        it('js to source: ' + caseName, async function () {
            const folderName = getRandomStr() + '_jssrc'
            compileJS(caseName, caseRoot, false, folderName)
            const render = require(join(caseRoot, caseName, 'output', folderName, 'ssr.js'))
            const ssrSpecPath = join(caseRoot, `${caseName}/ssr-spec.js`)
            if (existsSync(ssrSpecPath)) {
                require(ssrSpecPath)
            }
            // 测试在 strict mode，因此需要手动传入 require
            const got = render(...getRenderArguments(caseName, caseRoot))
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })

        it('component to source: ' + caseName, async function () {
            const folderName = getRandomStr() + '_comsrc'
            compileComponent(caseName, caseRoot, false, folderName)
            // eslint-disable-next-line
            const render = require(join(caseRoot, caseName, 'output', folderName, 'ssr.js'))
            // 测试在 strict mode，因此需要手动传入 require
            const got = render(...getRenderArguments(caseName, caseRoot))
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })

        it('component to renderer: ' + caseName, async function () {
            const got = renderOnthefly(caseName, caseRoot)
            const [data, html] = parseSanHTML(got)

            expect(data).toEqual(expectedData)
            expect(html).toEqual(expectedHtml)
        })
    }
}

function getRandomStr () {
    return Math.random().toString(36).slice(2)
}
