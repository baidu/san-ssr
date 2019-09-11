import { Compiler } from '../../src/transpilers/ts2php'
import { resolve } from 'path'

describe('ts2php', function () {
    const tsconfig = resolve(__dirname, '../tsconfig.json')

    it('should compile a single file', function () {
        const cc = new Compiler(tsconfig)
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const result = cc.compileComponent(path)
        console.log(result)
    })
})
