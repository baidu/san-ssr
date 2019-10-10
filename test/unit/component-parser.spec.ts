import { Project } from 'ts-morph'
import { ComponentParser } from '../../src/parsers/component-parser'
import { SanSourceFile } from '../../src/parsers/san-sourcefile'
import { resolve } from 'path'

describe('ComponentParser', function () {
    const tsConfigFilePath = resolve(__dirname, '../tsconfig.json')

    it('should parse a single class', function () {
        const path = resolve(__dirname, '../stub/foo.ts')
        const parser = ComponentParser.createUsingTsconfig(tsConfigFilePath)
        const comp = parser.parseComponent(path)

        expect(comp.getFile(path).getFullText()).toContain('public static foo: string = \'FOO\'')
    })

    it('should parse a component class', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const parser = ComponentParser.createUsingTsconfig(tsConfigFilePath)
        const comp = parser.parseComponent(path)
        const result = comp.getFile(path).getFullText()

        expect(result).toContain('class A extends Component')
        expect(result).toContain('public static template = \'A\'')
        expect(result).toContain('static spsrCid: number = 0')
    })

    it('should parse dependency of component class', function () {
        const path = resolve(__dirname, '../stub/b.comp.ts')
        const foo = resolve(__dirname, '../stub/foo.ts')
        const parser = ComponentParser.createUsingTsconfig(tsConfigFilePath)
        const comp = parser.parseComponent(path)
        const result = comp.getFile(foo).getFullText()

        expect(result).toContain('public static foo: string = \'FOO\'')
    })
})
