import { SanAppParser } from '../../src/parsers/san-app-parser'
import { ToPHPCompiler } from '../../src/target-php'
import { Project } from 'ts-morph'
import { resolve } from 'path'

describe('ToPHPCompiler', function () {
    const tsConfigFilePath = resolve(__dirname, '../tsconfig.json')
    const project = new Project({ tsConfigFilePath })
    const parser = new SanAppParser(project)
    const cc = new ToPHPCompiler({ project, tsConfigFilePath })

    it('should compile a component file', function () {
        const filepath = resolve(__dirname, '../stub/a.comp.ts')
        const sanApp = parser.parseSanApp(filepath)
        const result = cc.compile(sanApp, {})

        expect(result).toContain('class A extends Component {\n')
        expect(result).toContain('public static $template = "A";\n')
    })

    it('should compile filters into static methods', function () {
        const filepath = resolve(__dirname, '../stub/filters.comp.ts')
        const sanApp = parser.parseSanApp(filepath)
        const result = cc.compile(sanApp, {})

        expect(result).toContain('public static $filters;')
        expect(result).toContain('A::$filters = array(')
        expect(result).toContain('"add" => function ($x, $y)')
    })

    it('should compile a whole component', function () {
        const filepath = resolve(__dirname, '../stub/a.comp.ts')
        const parser = new SanAppParser(project)
        const sanApp = parser.parseSanApp(filepath)
        const result = cc.compile(sanApp, {})

        expect(result).toContain('namespace san\\stub\\aComp {')
        expect(result).toContain('class A extends Component {')
        expect(result).toContain('ComponentRegistry::$comps = [')
        expect(result).toContain('"0" => \'\\san\\stub\\aComp\\A\'')
    })

    it('should respect modules config for ts2php', function () {
        const filepath = resolve(__dirname, '../stub/b.comp.ts')
        const project = new Project({ tsConfigFilePath })
        const parser = new SanAppParser(project)
        const result1 = cc.compile(parser.parseSanApp(filepath), {})

        expect(result1).toContain('require_once("lodash")')

        const result2 = cc.compile(parser.parseSanApp(filepath), {
            modules: {
                lodash: {
                    name: 'lodash',
                    required: true
                }
            }
        })

        expect(result2).not.toContain('require_once("lodash")')
    })
})
