import { Compiler } from '../../src/transpilers/ts2php'
import { ComponentParser } from '../../src/transpilers/component-parser'
import { resolve } from 'path'

describe('ts2php', function () {
    const tsconfigPath = resolve(__dirname, '../tsconfig.json')

    it('should compile a component file', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const parser = new ComponentParser(path, tsconfigPath)
        const cc = new Compiler({ tsconfigPath })

        const file = parser.parseComponent().get(path)
        const result = cc.compileToPHP(file)
        const expected = 'class A {\n' +
            '    public static $template = "A";\n' +
            '}\n'

        expect(result).toEqual(expected)
    })

    it('should compile a whole component', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const parser = new ComponentParser(path, tsconfigPath)
        const cc = new Compiler({ tsconfigPath })
        const component = parser.parseComponent()
        const result = cc.compileComponent(component)

        expect(result).toContain('namespace stub\\aComp {')
        expect(result).toContain('class A {')
        expect(result).toContain('function get_comp_class($cid)')
    })

    it('should compile filters into static methods', function () {
        const path = resolve(__dirname, '../stub/filters.comp.ts')
        const parser = new ComponentParser(path, tsconfigPath)
        const cc = new Compiler({ tsconfigPath })
        const file = parser.parseComponent().get(path)
        const result = cc.compileToPHP(file)

        expect(result).toContain('class A {\n    public static $filters;\n}')
        expect(result).toContain('A::$filters = array(')
        expect(result).toContain('"add" => function ($x, $y)')
    })
})
