import chalk from 'chalk'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseHtml, compileToJS, compileToPHP } from '../utils/case'
import { renderByJS, renderByPHP } from './case'
import { measure, startMeasure } from '../utils/timing'

const caseName = process.argv[2]
const htmlPath = resolve(__dirname, '../../test/cases', caseName, 'result.html')
const expected = readFileSync(htmlPath, 'utf8')
const [expectedData, expectedHtml] = parseHtml(expected)

console.log(chalk.green('[COMP  JS]'), measure(() => compileToJS(caseName)))
console.log(chalk.green('[COMP PHP]'), measure(() => compileToPHP(caseName)))

check(`[EXPECTED] ${caseName}`, () => expected)
check(`[SSR   JS] ${caseName}`, () => renderByJS(caseName))
check(`[SSR  PHP] ${caseName}`, () => renderByPHP(caseName))

function check (title, render) {
    const renderJSMeasure = startMeasure()
    const got = render()
    const result = test(got)

    console.log(
        chalk[result ? 'green' : 'red'](title),
        renderJSMeasure.duration()
    )
    console.log(got + '\n')
    if (!result) process.exit(1)
}

function test (got) {
    const [data, html] = parseHtml(got)
    return deepEqual(data, expectedData) && html === expectedHtml
}

function deepEqual (lhs, rhs) {
    if (typeof lhs === 'object') {
        for (const key of Object.keys(lhs)) {
            if (!deepEqual(rhs[key], rhs[key])) return false
        }
        return true
    }
    return JSON.stringify(lhs) === JSON.stringify(rhs)
}
