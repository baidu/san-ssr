import { Compiler } from '../../src/transpilers/ts2php'
import { ComponentParser } from '../../src/transpilers/component-parser'
import { resolve } from 'path'

describe('ts2php', function () {
    const tsconfig = resolve(__dirname, '../tsconfig.json')

    it('should compile a component file', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const parser = new ComponentParser(path, tsconfig)
        const cc = new Compiler(tsconfig)

        const file = parser.parseComponent().get(path)
        const result = cc.compileToPHP(file)
        const expected = 'class A {\n' +
            '    public static $template = "A";\n' +
            '}\n'

        expect(result).toEqual(expected)
    })

    it('should compile a whole component', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const parser = new ComponentParser(path, tsconfig)
        const cc = new Compiler(tsconfig)

        const component = parser.parseComponent()
        const result = cc.compileComponent(component)

        const getCompClassFunc =
            'namespace \\san\\runtime {\n' +
            '    $spsr_components = ["0" => \\stub\\a_comp\\A];\n' +
            '    function get_comp_class($cid) {\n' +
            '        return $spsr_components[$cid];\n' +
            '    }\n' +
            '}'

        expect(result).toContain('namespace stub\\a_comp {')
        expect(result).toContain('class A {')
        expect(result).toContain(getCompClassFunc)
    })
})
