import { ToJSCompiler } from '../../src/compilers/to-js-compiler'
import { ComponentParser } from '../../src/parsers/component-parser'
import { resolve } from 'path'

describe('ToJSCompiler', function () {
    const tsConfigFilePath = resolve(__dirname, '../tsconfig.json')
    const cc = new ToJSCompiler({ tsConfigFilePath })

    it('should a single class', function () {
        const path = resolve(__dirname, '../stub/foo.ts')
        const parser = ComponentParser.createUsingTsconfig(tsConfigFilePath)
        const file = parser.parseComponent(path).getComponentSourceFile()
        const result = cc.compileToJS(file)

        expect(result).toContain('class Foo {')
        expect(result).toContain('Foo.foo = \'FOO\'')
    })

    it('should mark component class with cid', function () {
        const parser = ComponentParser.createUsingTsconfig(tsConfigFilePath)
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const file = parser.parseComponent(path).getComponentSourceFile()
        const result = cc.compileToJS(file)

        expect(result).toContain('class A extends')
        expect(result).toContain('A.template = \'A\'')
        expect(result).toContain('A.sanssrCid = 0')
    })

    it('should evalComponentClass', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const parser = ComponentParser.createUsingTsconfig(tsConfigFilePath)
        const cc = new ToJSCompiler({ tsConfigFilePath })
        const comp = parser.parseComponent(path)
        const componentClass = cc.evalComponentClass(comp)

        expect(componentClass.template).toEqual('A')
        expect(componentClass.sanssrCid).toEqual(0)
    })
})
