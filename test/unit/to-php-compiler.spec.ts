import { ToPHPCompiler } from '../../src/compilers/to-php-compiler'
import { Project } from 'ts-morph'
import { ComponentParser } from '../../src/parsers/component-parser'
import { SanSourceFile } from '../../src/parsers/san-sourcefile'
import { resolve } from 'path'

describe('ToPHPCompiler', function () {
    const tsConfigFilePath = resolve(__dirname, '../tsconfig.json')
    const cc = new ToPHPCompiler({ tsConfigFilePath })

    it('should compile a component file', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const result = cc.compileFromTS(path)

        expect(result).toContain('class A extends Component {\n')
        expect(result).toContain('public static $template = "A";\n')
    })

    it('should compile filters into static methods', function () {
        const path = resolve(__dirname, '../stub/filters.comp.ts')
        const result = cc.compileFromTS(path)

        expect(result).toContain('public static $filters;')
        expect(result).toContain('A::$filters = array(')
        expect(result).toContain('"add" => function ($x, $y)')
    })

    it('should compile a whole component', function () {
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const result = cc.compileFromTS(path)

        expect(result).toContain('namespace san\\stub\\aComp {')
        expect(result).toContain('class A extends Component {')
        expect(result).toContain('ComponentRegistry::$comps = [')
        expect(result).toContain('"0" => \'\\san\\stub\\aComp\\A\'')
    })
})
