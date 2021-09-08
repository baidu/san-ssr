import { SanProject } from '../../../src/models/san-project'
import { defineComponent } from 'san'
import { resolve } from 'path'

const stubRoot = resolve(__dirname, '../../stub')

describe('SanProject', function () {
    it('should not throw if called with no options', function () {
        expect(() => new SanProject()).not.toThrow()
    })

    it('should not throw if tsConfigFilePath not specified', function () {
        // simulate the case when no tsconfig specified
        expect(() => new SanProject(null)).not.toThrow()
    })

    describe('#parseSanSourceFile()', () => {
        it('should compile TypeScript to JavaScript renderer by default', function () {
            const proj = new SanProject(null)
            expect(() => proj.parseSanSourceFile(resolve(stubRoot, './a.comp.ts'))).toThrow(/tsconfig not specified/)
        })
    })

    describe('#compile()', () => {
        it('should compile TypeScript to JavaScript renderer by default', function () {
            const proj = new SanProject()
            const code = proj.compile(resolve(stubRoot, './a.comp.ts'))

            expect(code).toContain('html += "A')
            expect(code).toContain('module.exports =')
        })

        it('should support TypeScript FileDescriptor', function () {
            const proj = new SanProject()
            const code = proj.compile({
                filePath: resolve(stubRoot, './a.comp.ts'),
                fileContent: `
                    import { Component } from 'san'

                    export default class A extends Component {
                        public static template = '<div>B</div>'
                    }
                `
            })

            expect(code).toContain('html += "B')
        })

        it('should compile JavaScript to JavaScript renderer', function () {
            const proj = new SanProject()
            const code = proj.compile(resolve(stubRoot, './a.comp.js'))

            expect(code).toContain('html += "A')
        })

        it('should compile ComponentClass to JavaScript renderer', function () {
            const proj = new SanProject()
            const componentClass = defineComponent({ template: '<span>A</span>' })
            const code = proj.compile(componentClass as any)

            expect(code).toContain('html += "A')
        })

        it('should support bare function output', function () {
            const proj = new SanProject()
            const componentClass = require(resolve(stubRoot, './a.comp.js'))
            const code = proj.compile(componentClass, 'js', {
                bareFunctionBody: true
            })

            expect(code).toContain('html += "A')
            expect(code).toMatch(/sanSSRHelpers = /)
        })

        it('should not throw if tsConfigFilePath not specified', function () {
            const proj = new SanProject(null)
            const componentClass = require(resolve(stubRoot, './a.comp.js'))
            expect(() => proj.compile(componentClass, 'js')).not.toThrow()
        })

        it('should support SanFileDescriptor', function () {
            const proj = new SanProject()
            const code = proj.compile({
                filePath: resolve(stubRoot, './a.san'),
                templateContent: '<div>{{name}}</div>',
                scriptContent: `
                    import { Component } from 'san'
                    export default { inited() { this.data.set('name', 'san') } }
                `
            })

            expect(code).toContain('html += "<div"')
            expect(code).toContain('html += _.output(ctx.data.name, true)')
            expect(code).toContain('html += "</div>"')
        })
    })

    describe('#compileToRenderer()', function () {
        it('should compile to a renderer function', function () {
            const proj = new SanProject()
            const render = proj.compileToRenderer(require(resolve(stubRoot, './name.comp.js')))

            expect(render).toBeInstanceOf(Function)
            expect(render({ name: 'Harttle' }, {
                noDataOutput: true
            })).toEqual('<div>name: Harttle</div>')
        })

        it('the noDataOutput parameter should be optional and default to false', function () {
            const proj = new SanProject()
            const componentClass = defineComponent({ template: '<div>{{name}}</div>' })
            const render = proj.compileToRenderer(componentClass)

            expect(render).toBeInstanceOf(Function)
            expect(render({ name: 'Harttle' })).toEqual('<div><!--s-data:{"name":"Harttle"}-->Harttle</div>')
        })

        it('should escape consecutive hyphen', function () {
            const proj = new SanProject()
            const componentClass = defineComponent({ template: '<div>{{ a + b + c + d }}</div>' })
            const render = proj.compileToRenderer(componentClass)

            expect(render({
                a: -3,
                b: '---',
                c: '-',
                d: '\\--'
            })).toEqual('<div><!--s-data:{"a":-3,"b":"-\\-\\-","c":"-","d":"\\\\-\\-"}-->-3----\\--</div>')
        })
    })

    describe('#compileToSource()', function () {
        it('should default to JavaScript source', function () {
            const proj = new SanProject()
            const code = proj.compileToSource(resolve(stubRoot, './a.comp.ts'))

            expect(code).toContain('module.exports = ')
        })

        it('should compile to a renderer function which accepts data', function () {
            const proj = new SanProject()
            const render = proj.compileToRenderer(require(resolve(stubRoot, './name.comp.js')))

            expect(render).toBeInstanceOf(Function)
            expect(render({ name: 'Harttle' }, {
                noDataOutput: true
            })).toEqual('<div>name: Harttle</div>')
        })

        it('should remove modules', function () {
            const proj = new SanProject()
            const code = proj.compileToSource(resolve(stubRoot, './remove-modules.comp.ts'), 'js', {
                removeModules: [/^foo/]
            })
            expect(code).not.toContain('require("foo")')
            expect(code).toContain('require("bar")')
        })
    })
    describe('.getOrCreateTargetCodeGenerator()', () => {
        let proj: SanProject
        beforeEach(() => { proj = new SanProject() })
        it('should return compiler for target-js', () => {
            const compiler = proj.getOrCreateTargetCodeGenerator('js')
            expect(compiler.constructor.name).toEqual('ToJSCompiler')
        })
        it('should find compiler if installed (ESM)', () => {
            const compiler = proj.getOrCreateTargetCodeGenerator('fake-esm')
            expect(compiler.constructor.name).toEqual('FakeESM')
        })
        it('should find compiler if installed (CMD)', () => {
            const compiler = proj.getOrCreateTargetCodeGenerator('fake-cmd')
            expect(compiler.constructor.name).toEqual('FakeCMD')
        })
        it('should throw if compiler not found', () => {
            expect(() => proj.getOrCreateTargetCodeGenerator('rust'))
                .toThrow('failed to load "san-ssr-target-rust"')
        })
    })
    describe('#emitHelpers()', function () {
        it('should emit js helpers by default', function () {
            const proj = new SanProject(null)
            const helpers = proj.emitHelpers('js')

            // eslint-disable-next-line
            const helpersModule = new Function('exports', helpers)
            const exports = {}
            helpersModule(exports)
            expect(exports).toHaveProperty('_')
            expect(exports).toHaveProperty('SanSSRData')
            expect(exports).toHaveProperty('createResolver')
        })
    })
})
