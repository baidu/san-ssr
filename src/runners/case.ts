import { execSync } from './exec'
import { resolve } from 'path'

export function renderByJS (caseName) {
    return execSync(resolve(__dirname, `../../bin/render.js`), [caseName])
}

export function renderByPHP (caseName) {
    return execSync(resolve(__dirname, `../../bin/render.php`), [caseName])
}

export function compileAllToJS () {
    return execSync(resolve(__dirname, `../../bin/compile-to-js.js`), ['--all'])
}

export function compileAllToPHP () {
    return execSync(resolve(__dirname, `../../bin/compile-to-php.js`), ['--all'])
}

export function compileToJS (caseName) {
    return execSync(resolve(__dirname, `../../bin/compile-to-js.js`), [caseName])
}

export function compileToPHP (caseName) {
    return execSync(resolve(__dirname, `../../bin/compile-to-php.js`), [caseName])
}
