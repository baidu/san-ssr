import { isTypedComponentInfo, TypedComponentInfo, DynamicComponentInfo } from '../../../src/models/component-info'
import { Project } from 'ts-morph'
import { ANode, defineComponent } from 'san'

describe('TypedComponentInfo', function () {
    let proj
    beforeEach(() => {
        proj = new Project({ addFilesFromTsConfig: false })
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
            const info = new TypedComponentInfo('id', 'template', null as ANode, new Map(), file.getClass('Foo'))
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
        const info = new DynamicComponentInfo('id', 'template', null as ANode, new Map(), component)
        expect(info.getFilterNames()).toEqual(['a', 'x-b', 'b'])
    })
    it('should return empty array if filters not defined', () => {
        const component = defineComponent({})
        const info = new DynamicComponentInfo('id', 'template', null as ANode, new Map(), component)
        expect(info.getFilterNames()).toEqual([])
    })
})

describe('.isTypedComopnentInfo()', function () {
    it('should return true for typed component info', () => {
        const proj = new Project({ addFilesFromTsConfig: false })
        const file = proj.createSourceFile('foo.ts', `
        function b() {}
        class Foo {
            filters = {
                a(){},
                'x-b': function () {},
                b
            }
        }`)
        const info = new TypedComponentInfo('id', 'template', null as ANode, new Map(), file.getClass('Foo'))
        expect(isTypedComponentInfo(info)).toBeTruthy()
    })
    it('should return false for dynamic component info', () => {
        const component = defineComponent({})
        const info = new DynamicComponentInfo('id', 'template', null as ANode, new Map(), component)
        expect(isTypedComponentInfo(info)).toBeFalsy()
    })
})
