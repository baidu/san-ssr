import { createResolver } from '../../../src/runtime/resolver'
import { join } from 'path'
import san from 'san'

describe('runtime/resolver', () => {
    const resolver = createResolver({}, require)

    it('should resolve render from external module', () => {
        const render = resolver.getRenderer({ id: '0', specifier: join(__dirname, '../../stub/ssr.js') })
        expect(render()).toEqual('hello')
    })

    it('should change by custom require path', () => {
        const render = resolver.getRenderer(
            { id: '0', specifier: 'aaa' },
            '',
            { customSSRFilePath: () => join(__dirname, '../../stub/ssr.js') }
        )
        expect(render()).toEqual('hello')
    })

    describe('./getChildComponentClass()', () => {
        const ChildA = san.defineComponent({
            template: ''
        })
        const ChildB = san.defineComponent({
            template: ''
        })
        const MyComponent = san.defineComponent({
            template: '',
            // @ts-ignore
            components: {
                'child-a': ChildA,
                'child-b': ChildA,
                'child-c': 'self',
                'child-d': 123
            }
        })
        const ref = { id: 'id', specifier: './som/path' }
        it('should get child component class', () => {
            const ResComponent = resolver.getChildComponentClass({ id: 'id' }, MyComponent, 'child-a')
            expect(ResComponent === ChildA).toBe(true)
        })

        it('should change child component class by class', () => {
            const ResComponent2 = resolver.getChildComponentClass(ref, MyComponent, 'child-b', {
                customComponentFilePath () {
                    return ChildB
                }
            })
            expect(ResComponent2 === ChildB).toBe(true)
        })

        it('should change child component class by path', () => {
            const ChildC = require('../../stub/a.comp')
            const { C: ChildD } = require('../../stub/b.comp')
            const ResComponent5 = resolver.getChildComponentClass({ id: 'default', specifier: '/' }, MyComponent, 'child-b', {
                customComponentFilePath () {
                    return '../../stub/a.comp'
                }
            })
            expect(ChildC === ResComponent5).toBe(true)
            const ResComponent6 = resolver.getChildComponentClass({ id: 'C', specifier: '/' }, MyComponent, 'child-b', {
                customComponentFilePath () {
                    return '../../stub/b.comp'
                }
            })
            expect(ChildD === ResComponent6).toBe(true)
        })

        it('should not change part of child component class', () => {
            const ResComponent4 = resolver.getChildComponentClass(ref, MyComponent, 'child-b', {
                customComponentFilePath ({ id }) {
                    if (id !== 'id') return ChildB
                }
            })
            expect(ResComponent4 === ChildA).toBe(true)
        })

        it('should get self', () => {
            const ResComponent3 = resolver.getChildComponentClass(ref, MyComponent, 'child-c')
            expect(ResComponent3 === MyComponent).toBe(true)
        })

        it('should error if child component not found', () => {
            const fn = jest.fn()
            try {
                resolver.getChildComponentClass(ref, MyComponent, 'none-exist')
            } catch {
                fn()
            }
            expect(fn.mock.calls.length).toBe(1)
        })

        it('should error if child component is not class or object', () => {
            const fn = jest.fn()
            try {
                resolver.getChildComponentClass(ref, MyComponent, 'child-d')
            } catch {
                fn()
            }
            expect(fn.mock.calls.length).toBe(1)
        })
    })
})
