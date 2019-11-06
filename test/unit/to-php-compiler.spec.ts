import { SanAppParser } from '../../src/parsers/san-app-parser'
import { ToPHPCompiler } from '../../src/target-php'
import { Project } from 'ts-morph'
import { resolve } from 'path'

describe('ToPHPCompiler', function () {
    const tsConfigFilePath = resolve(__dirname, '../tsconfig.json')

    it('should compile a component file', function () {
        const project = new Project({ tsConfigFilePath })
        const parser = new SanAppParser(project)
        const cc = new ToPHPCompiler({ project, tsConfigFilePath })
        const filepath = resolve(__dirname, '../stub/a.comp.ts')
        const sanApp = parser.parseSanApp(filepath)
        const result = cc.compile(sanApp, {})

        expect(result).toContain('class A extends SanComponent {\n')
        expect(result).toContain('public static $template = "A";\n')
    })

    it('should compile filters into static methods', function () {
        const project = new Project({ tsConfigFilePath })
        const parser = new SanAppParser(project)
        const cc = new ToPHPCompiler({ project, tsConfigFilePath })
        const filepath = resolve(__dirname, '../stub/filters.comp.ts')
        const sanApp = parser.parseSanApp(filepath)
        const result = cc.compile(sanApp, {})

        expect(result).toContain('public static $filters;')
        expect(result).toContain('A::$filters = array(')
        expect(result).toContain('"add" => function ($x, $y)')
    })

    it('should compile a whole component', function () {
        const project = new Project({ tsConfigFilePath })
        const cc = new ToPHPCompiler({ project, tsConfigFilePath })
        const filepath = resolve(__dirname, '../stub/a.comp.ts')
        const parser = new SanAppParser(project)
        const sanApp = parser.parseSanApp(filepath)
        const result = cc.compile(sanApp, {})

        expect(result).toContain('namespace san\\stub\\aComp {')
        expect(result).toContain('class A extends SanComponent {')
        expect(result).toContain('ComponentRegistry::$comps = [')
        expect(result).toContain('"0" => \'\\san\\stub\\aComp\\A\'')
    })

    it('should respect modules config for ts2php', function () {
        const filepath = resolve(__dirname, '../stub/b.comp.ts')
        const project1 = new Project({ tsConfigFilePath })
        const parser1 = new SanAppParser(project1)
        const cc1 = new ToPHPCompiler({ project: project1, tsConfigFilePath })
        const result1 = cc1.compile(parser1.parseSanApp(filepath), {})

        expect(result1).toContain('require_once("lodash")')

        const project2 = new Project({ tsConfigFilePath })
        const parser2 = new SanAppParser(project2)
        const cc2 = new ToPHPCompiler({ project: project2, tsConfigFilePath })
        const result2 = cc2.compile(parser2.parseSanApp(filepath), {
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
