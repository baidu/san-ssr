import { ToJSCompiler } from '../../src/transpilers/to-js-compiler'
import { ComponentParser } from '../../src/parser/component-parser'
import { resolve } from 'path'

describe('ts2js', function () {
    const tsconfig = resolve(__dirname, '../tsconfig.json')

    it('should a single class', function () {
        const path = resolve(__dirname, '../stub/obj.ts')
        const parser = new ComponentParser(tsconfig)

        const file = parser.parseComponent(path).getComponentSourceFile()
        const cc = new ToJSCompiler(tsconfig)
        const result = cc.compileToJS(file)

        expect(result).toContain('class Foo {')
        expect(result).toContain('Foo.foo = \'FOO\'')
    })

    it('should mark component class with cid', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const parser = new ComponentParser(tsconfig)

        const file = parser.parseComponent(path).getComponentSourceFile()
        const cc = new ToJSCompiler(tsconfig)
        const result = cc.compileToJS(file)

        expect(result).toContain('class A extends')
        expect(result).toContain('A.template = \'A\'')
        expect(result).toContain('A.spsrCid = 0')
    })

    it('should compile and run a component', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const parser = new ComponentParser(tsconfig)

        const file = parser.parseComponent(path).getComponentSourceFile()
        const cc = new ToJSCompiler(tsconfig)
        const componentClass = cc.compileAndRun(file)['default']

        expect(componentClass.template).toEqual('A')
        expect(componentClass.spsrCid).toEqual(0)
    })
})
