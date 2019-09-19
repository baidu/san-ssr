import { Compiler } from '../../src/transpilers/ts2js'
import { ComponentParser } from '../../src/parser/component-parser'
import { resolve } from 'path'

describe('ts2js', function () {
    const tsconfig = resolve(__dirname, '../tsconfig.json')

    it('should a single class', function () {
        const path = resolve(__dirname, '../stub/obj.ts')
        const parser = new ComponentParser(path, tsconfig)

        const file = parser.parseComponent().get(path)
        const cc = new Compiler(tsconfig)
        const result = cc.compileToJS(file)

        expect(result).toContain('class Foo {')
        expect(result).toContain('Foo.foo = \'FOO\'')
    })

    it('should mark component class with cid', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const parser = new ComponentParser(path, tsconfig)

        const file = parser.parseComponent().get(path)
        const cc = new Compiler(tsconfig)
        const result = cc.compileToJS(file)

        expect(result).toContain('class A extends')
        expect(result).toContain('A.template = \'A\'')
        expect(result).toContain('A.spsrId = 0')
    })

    it('should compile and run a component', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const parser = new ComponentParser(path, tsconfig)

        const file = parser.parseComponent().get(path)
        const cc = new Compiler(tsconfig)
        const componentClass = cc.compileAndRun(file)['default']

        expect(componentClass.template).toEqual('A')
        expect(componentClass.spsrId).toEqual(0)
    })
})
