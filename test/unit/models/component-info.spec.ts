import { JSComponentInfo, TypedComponentInfo, DynamicComponentInfo } from '../../../src/models/component-info'
import { getPropertiesFromObject } from '../../../src/ast/js-ast-util'
import { CallExpression, ExpressionStatement, ObjectExpression, parse } from 'acorn'
import { Project } from 'ts-morph'
import { AElement, ANode, defineComponent } from 'san'

describe('TypedComponentInfo', function () {
    let proj: Project
    beforeEach(() => {
        proj = new Project({ skipAddingFilesFromTsConfig: true })
    })
    describe('#getFilterNames()', function () {
        it('should return filter names', () => {
            const file = proj.createSourceFile('foo.ts', `
            function b() {}
            class Foo {
                filters = {
                    a(){},
                    'x-b': function () {},
                    b
                }
            }`)
            const info = new TypedComponentInfo('id', null as ANode, new Map(), undefined, true, true, file.getClass('Foo'))
            expect(info.getFilterNames()).toEqual(['a', 'x-b', 'b'])
        })
    })
})

describe('DynamicComponentInfo', function () {
    it('should return filter names', () => {
        function b () {}
        const component = defineComponent({
            filters: {
                a () {},
                'x-b': function () {},
                b
            }
        })
        const info = new DynamicComponentInfo('id', null as ANode, new Map(), 'normal', undefined, true, true, component)
        expect(info.getFilterNames()).toEqual(['a', 'x-b', 'b'])
    })
    it('should return empty array if filters not defined', () => {
        const component = defineComponent({})
        const info = new DynamicComponentInfo('id', null as ANode, new Map(), 'normal', undefined, true, true, component)
        expect(info.getFilterNames()).toEqual([])
    })
})

describe('JSComponentInfo', function () {
    it('should support custom delimiters', () => {
        const obj = ((parse(`
            defineComponent({
                template: '<div>{%name%}</div>',
                delimiters: ['{%', '%}']
            })
        `, { ecmaVersion: 2022 })['body'][0] as ExpressionStatement).expression as CallExpression).arguments[0]
        const props = new Map(getPropertiesFromObject(obj as ObjectExpression))
        const info = new JSComponentInfo('foo', 'foo', props, '')
        expect(info.root).toHaveProperty('tagName', 'div')
        expect((info.root as AElement).children[0]).toMatchObject({
            textExpr: {
                type: 4,
                paths: [{ value: 'name' }]
            }
        })
    })
    it('should support hasMethod()', () => {
        const obj = ((parse(`
            defineComponent({
                inited() {}
            })
        `, { ecmaVersion: 2022 })['body'][0] as ExpressionStatement).expression as CallExpression).arguments[0]
        const props = new Map(getPropertiesFromObject(obj as ObjectExpression))
        const info = new JSComponentInfo('foo', 'foo', props, '')
        expect(info.hasMethod('inited')).toBeTruthy()
        expect(info.hasMethod('attached')).toBeFalsy()
    })
    it('should support getFilterNames()', () => {
        const obj = ((parse(`
            defineComponent({
                template: '<div>{{name}}</div>',
                filters: { foo: () => false, bar: () => 0 }
            })
        `, { ecmaVersion: 2022 })['body'][0] as ExpressionStatement).expression as CallExpression).arguments[0]
        const props = new Map(getPropertiesFromObject(obj as ObjectExpression))
        const info = new JSComponentInfo('foo', 'foo', props, '')
        expect(info.getFilterNames()).toEqual(['foo', 'bar'])
    })
    it('should support getComputedNames()', () => {
        const obj = ((parse(`
            defineComponent({
                template: '<div>{{name}}</div>',
                computed: { foo: () => false, bar: () => 0 }
            })
        `, { ecmaVersion: 2022 })['body'][0] as ExpressionStatement).expression as CallExpression).arguments[0]
        const props = new Map(getPropertiesFromObject(obj as ObjectExpression))
        const info = new JSComponentInfo('foo', 'foo', props, '')
        expect(info.getComputedNames()).toEqual(['foo', 'bar'])
    })
})
