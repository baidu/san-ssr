import { execCommandSync as execSync } from './exec'
import { resolve } from 'path'

export function renderByJS (caseName) {
    return execSync(resolve(__dirname, `../../bin/render.js`), [caseName])
}

export function compileAllToJS () {
    return execSync(resolve(__dirname, `../../bin/compile-to-js.js`), ['--all'])
}

export function compileToJS (caseName) {
    return execSync(resolve(__dirname, `../../bin/compile-to-js.js`), [caseName])
}
