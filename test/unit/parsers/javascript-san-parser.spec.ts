import { JavaScriptSanParser } from '../../../src/parsers/javascript-san-parser'

describe('JavaScriptSanParser', () => {
    describe('#parseImportedNames()', () => {
        it('should parse imports', () => {
            const script = `
            import { Component } from 'san'
            const define = require('san').defineComponent
            `
            const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
            const imports = [...parser.parseImportedNames()]
            expect(imports).toHaveLength(2)
            expect(imports[0]).toEqual(['Component', 'san', 'Component'])
            expect(imports[1]).toEqual(['define', 'san', 'defineComponent'])
        })
    })
    describe('#parseComponents()', () => {
        describe('ESM', () => {
            it('should parse a single component from ESM', () => {
                const script = `
                import { Component } from 'san'
                export default class XComponent extends Component {
                    constructor() {
                        let foo = () => 1
                        this.computed = { foo }
                    }
                    inited() {}
                }
                `
                const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
                parser.parseNames()
                const [components, entry] = parser.parseComponents()
                expect(components).toHaveLength(1)
                expect(components[0]).toEqual(entry)
                expect(entry).toHaveProperty('id', 'default')
                expect(entry.getComputedNames()).toEqual(['foo'])
                expect(entry.hasMethod('inited')).toBeTruthy()
                expect(entry.hasMethod('created')).toBeFalsy()
            })
            it('should parse multiple components from ESM', () => {
                const script = `
                import san from 'san'
                export class XComponent extends san.Component {}
                export default class YComponent extends san.Component {}
                `
                const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
                parser.parseNames()
                const [components, entry] = parser.parseComponents()
                expect(entry).toHaveProperty('id', 'default')
                expect(components).toHaveLength(2)
                expect(components[1]).toEqual(entry)
            })
            it('should parse define components from ESM', () => {
                const script = `
                import { defineComponent } from 'san'
                import san from 'san'
                const YComponent = defineComponent({ template: '<input>' })
                export default san.defineComponent({ template: '<button>' })
                `
                const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
                parser.parseNames()
                const [components, entry] = parser.parseComponents()
                expect(entry).toHaveProperty('id', 'default')
                expect(components).toHaveLength(2)
                expect(components[1]).toEqual(entry)
            })
            it('should parse const foo = defineComponent()', () => {
                const script = `
                import { defineComponent } from 'san'
                let Foo
                Foo = defineComponent({})
                export const Bar = Foo
                `
                const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
                parser.parseNames()
                const [components] = parser.parseComponents()
                expect(components[0]).toHaveProperty('id', 'Bar')
            })
            it('should parse with custom san module', () => {
                const script = `
                import { define } from 'other-san'
                let Foo
                Foo = define({})
                export const Bar = Foo
                `
                const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module', {
                    sanReferenceInfo: {
                        methodName: 'define',
                        moduleName: 'other-san'
                    }
                })
                parser.parseNames()
                const [components] = parser.parseComponents()
                expect(components[0]).toHaveProperty('id', 'Bar')
            })
        })
        describe('script', () => {
            it('should parse a single component from script', () => {
                const script = `
                const { Component } = require('san')
                exports = module.exports = class XComponent extends Component {}
                `
                const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
                parser.parseNames()
                const [components, entry] = parser.parseComponents()
                expect(entry).toHaveProperty('id', 'default')
                expect(components).toHaveLength(1)
                expect(components[0]).toEqual(entry)
            })
            it('should parse multiple components from script', () => {
                const script = `
                const { Component } = require('san')
                class YComponent extends Component {}
                module.exports = class XComponent extends Component {}
                `
                const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
                parser.parseNames()
                const [components, entry] = parser.parseComponents()
                expect(entry).toHaveProperty('id', 'default')
                expect(components).toHaveLength(2)
                expect(components[1]).toEqual(entry)
            })
            it('should parse define components from script', () => {
                const script = `
                const { defineComponent } = require('san')
                const san = require('san')
                const YComponent = defineComponent({ template: '<input>' })
                module.exports = san.defineComponent({ template: '<button>' })
                exports.ZComponent = require('san').defineComponent({ template: '<meta>' })
                `
                const parser = new JavaScriptSanParser('/tmp/foo.san', script)
                parser.parseNames()
                const [components, entry] = parser.parseComponents()
                expect(components).toHaveLength(3)
                expect(components[0]).toHaveProperty('id', 'YComponent')
                expect(components[1]).toHaveProperty('id', 'default')
                expect(components[2]).toHaveProperty('id', 'ZComponent')
                expect(entry).toEqual(components[1])
            })
            it('should coerce Component name into exported name', () => {
                const script = `
                import { defineComponent } from 'san'
                import san from 'san'
                const YComponent = defineComponent({ template: '<input>' })
                export const ZComponent = YComponent
                `
                const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
                parser.parseNames()
                const [components, entry] = parser.parseComponents()
                expect(entry).toBeUndefined()
                expect(components).toHaveLength(1)
                expect(components[0]).toHaveProperty('id', 'ZComponent')
            })
            it('should parse with custom san module', () => {
                const script = `
                const { define } = require('other-san')
                let Foo
                Foo = define({})
                exports.Bar = Foo
                `
                const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'script', {
                    sanReferenceInfo: {
                        methodName: 'define',
                        moduleName: 'other-san'
                    }
                })
                parser.parseNames()
                const [components] = parser.parseComponents()
                expect(components[0]).toHaveProperty('id', 'Bar')
            })
        })
    })
    describe('#wireChildComponents()', () => {
        it('should parse anonymous child components', () => {
            const script = `
            import { defineComponent } from 'san'
            export default defineComponent({
                components: {
                    foo: defineComponent({ computed: { foo: () => '' } })
                }
            })
            `
            const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
            parser.parseNames()
            const [components, entry] = parser.parseComponents()
            parser.wireChildComponents()
            expect(components).toHaveLength(2)
            expect(components[1]).toEqual(entry)
            expect(entry).toHaveProperty('id', 'default')
            expect(components[0].getComputedNames()).toEqual(['foo'])
        })
        it('should parse imported child components', () => {
            const script = `
            import { Foo, Bar } from './foo'
            import { defineComponent } from 'san'
            export default defineComponent({
                components: { 'f-o': Foo, Bar }
            })
            `
            const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
            parser.parseNames()
            const [components, entry] = parser.parseComponents()
            parser.wireChildComponents()
            expect(components).toHaveLength(1)
            expect(components[0]).toEqual(entry)
            expect(entry.childComponents).toHaveProperty('size', 2)
            expect(entry.childComponents.get('f-o')).toEqual({ specifier: './foo', id: 'Foo' })
            expect(entry.childComponents.get('Bar')).toEqual({ specifier: './foo', id: 'Bar' })
        })
        it('should throw for unrecognized child components', () => {
            const script = `
            import { defineComponent } from 'san'
            export default defineComponent({
                components: { foo: foo() }
            })
            `
            const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
            parser.parseNames()
            parser.parseComponents()
            expect(() => parser.wireChildComponents()).toThrow('[131,136) cannot parse components')
        })
        it('should reuse default loader components', () => {
            const script = `
            import { defineComponent, createComponentLoader } from 'san'
            export default defineComponent({
                components: { foo: createComponentLoader({}), bar: createComponentLoader({}) }
            })
            `
            const parser = new JavaScriptSanParser('/tmp/foo.san', script, 'module')
            parser.parseNames()
            const [components] = parser.parseComponents()
            parser.wireChildComponents()
            expect(components).toHaveLength(2)
        })
    })
    describe('#deleteChildComponentRequires()', () => {
        it('should ignore inner require', () => {
            const script = `
            const { defineComponent } = require('san')
            const childA = require('./path/to/a')
            function aaa() {
                const childA = require('./path/to/a')
            }
            const MyComponnet = defineComponent({
                components: {
                    'aaa': childA
                },
                template: '<aaa/>'
            })
            module.exports = MyComponent
            `

            const parser = new JavaScriptSanParser('/tmp/my.san', script, 'script')
            const res = parser.parse()
            expect(res.getFileContent().split('const childA = require(\'./path/to/a\')').length).toBe(2)
        })
    })
})
