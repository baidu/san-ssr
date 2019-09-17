import chalk from 'chalk'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { renderByJS, compileToJS } from './case'
import { measure, startMeasure } from '../utils/timing'

const caseName = process.argv[2]
const htmlPath = resolve(__dirname, '../test/cases', caseName, 'result.html')
const expected = readFileSync(htmlPath, 'utf8')

console.log(chalk.green('[COMP  JS]'), measure(() => compileToJS(caseName)))

check(`[EXPECTED] ${caseName}`, () => expected)
check(`[SSR   JS] ${caseName}`, () => renderByJS(caseName))

function check (title, render) {
    const renderJSMeasure = startMeasure()
    const html = render()
    const color = html === expected ? 'green' : 'red'
    console.log(chalk[color](title), renderJSMeasure.duration())
    console.log(html + '\n')
    if (html !== expected) process.exit(1)
}
