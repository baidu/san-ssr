import { exec } from './exec'
import { resolve } from 'path'

export function compileJS (caseName) {
    return exec(resolve(__dirname, '../bin/compile-to-js.ts'), [caseName])
}

export function compileAllJS () {
    exec(resolve(__dirname, '../bin/compile-to-js.ts'), ['--all'])
}

export function compilePHP (caseName) {
    return exec(resolve(__dirname, '../bin/compile-to-php.ts'), [caseName])
}

export function compileAllPHP () {
    exec(resolve(__dirname, '../bin/compile-to-php.ts'), ['--all'])
}

export function renderByJS (caseName) {
    return exec(resolve(__dirname, `../bin/render.js`), [caseName])
}

export function renderByPHP (caseName) {
    return exec(resolve(__dirname, `../bin/render.php`), [caseName])
}
