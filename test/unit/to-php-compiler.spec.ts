import { ToPHPCompiler } from '../../src/transpilers/to-php-compiler'
import { ComponentParser } from '../../src/parser/component-parser'
import { resolve } from 'path'

describe('ToPHPCompiler', function () {
    const tsConfigFilePath = resolve(__dirname, '../tsconfig.json')

    describe('compileToPHP', function () {
        it('should compile a component file', function () {
            const path = resolve(__dirname, '../stub/a.comp.ts')
            const parser = new ComponentParser(tsConfigFilePath)
            const cc = new ToPHPCompiler({ tsConfigFilePath })

            const file = parser.parseComponent(path).getComponentSourceFile()
            const result = cc.compileToPHP(file)
            const expected = 'class A extends Component {\n' +
                '    public static $template = "A";\n' +
                '}\n'

            expect(result).toEqual(expected)
        })

        it('should compile a whole component', function () {
            const path = resolve(__dirname, '../stub/a.comp.ts')
            const parser = new ComponentParser(tsConfigFilePath)
            const cc = new ToPHPCompiler({ tsConfigFilePath })
            const component = parser.parseComponent(path)
            const result = cc.transpileFiles(component)

            expect(result).toContain('namespace stub\\aComp {')
            expect(result).toContain('class A extends Component {')
            expect(result).toContain('ComponentRegistry::$comps = [')
            expect(result).toContain('"0" => "\\\\stub\\\\aComp\\\\A"')
        })

        it('should compile filters into static methods', function () {
            const path = resolve(__dirname, '../stub/filters.comp.ts')
            const parser = new ComponentParser(tsConfigFilePath)
            const cc = new ToPHPCompiler({ tsConfigFilePath })
            const file = parser.parseComponent(path).getComponentSourceFile()
            const result = cc.compileToPHP(file)

            expect(result).toContain('public static $filters;')
            expect(result).toContain('A::$filters = array(')
            expect(result).toContain('"add" => function ($x, $y)')
        })
    })
})
